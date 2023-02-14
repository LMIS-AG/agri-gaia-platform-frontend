import { Component, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, filter, map, of, switchMap, throwError } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';
import { CoopSpacesService } from '../coop-spaces.service';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { AddMembersAfterwardsDlgComponent } from './add-members-afterwards-dlg/add-members-afterwards-dlg.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-coop-space-details',
  templateUrl: './coop-space-details.component.html',
  styleUrls: ['./coop-space-details.component.scss'],
})
export class CoopSpaceDetailsComponent implements OnInit {
  public coopSpace?: CoopSpace;

  public displayedColumnsMember: string[] = ['name', 'company', 'role', 'more'];
  public displayedColumnsDataset: string[] = ['name', 'date', 'more'];
  public datasetDatasource: GeneralPurposeAsset[] = [];

  public userName: string | undefined;
  public fullName: string | undefined;
  public membersSelected: Member[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id =>
          this.coopSpacesService
            .getCoopSpaceById(id)
            .pipe(
              concatMap(coopSpace =>
                this.coopSpacesService.getAssets(coopSpace.id!).pipe(map(assets => ({ coopSpace, assets })))
              )
            )
        )
      )
      .subscribe({
        next: result => {
          if (result.coopSpace != null) {
            this.coopSpace = result.coopSpace;
          }
          this.datasetDatasource = result.assets;
        },
        error: error => {
          console.error(error);
          this.router.navigateByUrl('/coopspaces');
        },
      });
    // retrieve the username of the user that is currently logged in
    this.authenticationService.userProfile$.subscribe(userProfile => {
      if (userProfile === null) throw Error('userProfile was null.');
      this.userName = userProfile.username;
      this.fullName = `${userProfile.firstName} ${userProfile.lastName}`;
    });
  }

  public onDeleteMember(member: Member): void {
    this.uiService
      .confirm(
        `${member.name}`,
        translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationQuestion'),
        {
          buttonLabels: 'confirm',
          confirmButtonColor: 'primary',
        }
      )
      .subscribe(result => {
        if (result) {
          // modify the string before sending it, e.g. "USER" becomes "User"
          let role = member.role.toLowerCase();
          role = role.charAt(0).toUpperCase() + role.slice(1);

          // send the necessary data and remove the user from the member table
          this.coopSpacesService
            .deleteMember(member.id!, member.username, role, this.coopSpace!.name, this.coopSpace!.company)
            .subscribe({
              next: () => {
                this.coopSpace!.members = this.coopSpace!.members.filter(m => m.id !== member.id);
                this.uiService.showSuccessMessage(
                  translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationText')
                );
              },
              error: () => {
                this.uiService.showErrorMessage(
                  translate('dataManagement.coopSpaces.details.dialog.deleteMemberErrorText')
                );
              },
            });
        }
      });
  }

  public openSettings(): void {
    throw Error('Not yet implemented');
  }

  public addTool(): void {
    throw Error('Not yet implemented');
  }

  public addDataset(): void {
    throw Error('Not yet implemented');
  }

  public addMember(membersSelected: Member[], dialogRef: MatDialogRef<AddMembersAfterwardsDlgComponent>): void {
    this.coopSpacesService.addMember(this.coopSpace?.id!, membersSelected).subscribe({
      next: () => {
        this.uiService.showSuccessMessage(
          translate('dataManagement.coopSpaces.details.dialog.addMemberConfirmationText')
        );
        dialogRef.close(membersSelected);
      },
      error: () => {
        this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.addMemberErrorText'));
      },
    });
  }  
  
  public openAddMembersAfterwardsDialog(): void {
    const dialogRef = this.dialog.open(AddMembersAfterwardsDlgComponent, {
      minWidth: '60em',
      panelClass: 'resizable',
    });
  
    dialogRef.componentInstance.membersSelected.subscribe((membersSelected: Member[]) => {
      this.addMember(membersSelected, dialogRef);
      dialogRef.close(); // close the dialog when the user clicks on save
    });
    
    dialogRef.componentInstance.cancelEvent.subscribe(() => {
      dialogRef.close(); // close the dialog when the user clicks on cancel
    });
    
    dialogRef.afterClosed().subscribe();
  }    

  public onMore(): void {
    throw Error('Not yet implemented');
  }

  public onTogglePlay(): void {
    throw Error('Not yet implemented');
  }

  public openInFull(): void {
    this.router.navigate(['focus'], {
      relativeTo: this.route,
      state: { datasetDatasource: this.datasetDatasource },
    });
  }

  public handleDeleteMemberSuccess(): void {
    this.uiService.showSuccessMessage(
      translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationText')
    );
  }

  public handleDeleteMemberError(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteMemberErrorText'));
  }

  public getUserRole(): CoopSpaceRole | undefined {
    let member = this.coopSpace!.members.find(m => m.username === this.userName);
    if (member === undefined) return undefined;
    return member.role;
  }

  public isAdmin(): boolean {
    return this.getUserRole() === CoopSpaceRole.Admin;
  }

  public returnFullName(): String | undefined {
    return this.fullName;
  }
  
  }

