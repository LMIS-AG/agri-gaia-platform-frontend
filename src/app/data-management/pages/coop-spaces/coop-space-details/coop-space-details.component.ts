import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, filter, map, switchMap, tap } from 'rxjs';
import { CoopSpace, CoopSpaceRole, fromStringToCoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { GeneralPurposeAsset } from 'src/app/shared/model/general-purpose-asset';
import { CoopSpacesService } from '../coop-spaces.service';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { AddMembersAfterwardsDlgComponent } from './add-members-afterwards-dlg/add-members-afterwards-dlg.component';
import { MatDialog } from '@angular/material/dialog';
import { $enum } from 'ts-enum-util';
import { prettyPrintFileSize } from 'src/app/shared/utils/convert-utils';
import { BucketService } from '../../buckets/bucket.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTableDataSource } from '@angular/material/table';

@UntilDestroy()
@Component({
  selector: 'app-coop-space-details',
  templateUrl: './coop-space-details.component.html',
  styleUrls: ['./coop-space-details.component.scss'],
})
export class CoopSpaceDetailsComponent implements OnInit {
  public coopSpace?: CoopSpace;

  public displayedColumnsMember: string[] = ['name', 'company', 'role', 'more'];
  public displayedColumnsDataset: string[] = ['name', 'date', 'size', 'more'];
  public datasetDatasource: MatTableDataSource<GeneralPurposeAsset> = new MatTableDataSource();
  public memberDatasource: Member[] = [];

  public userName: string | undefined;
  public fullName: string | undefined;
  public membersSelected: Member[] = [];
  public originalRole: string = '';
  public roles: CoopSpaceRole[] = $enum(CoopSpaceRole).getValues();

  public bucket?: string;
  public isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private bucketService: BucketService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id =>
          this.coopSpacesService.getCoopSpaceById(id).pipe(
            tap(coopSpace => (this.memberDatasource = coopSpace.members)),
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
            this.bucket = `prj-${this.coopSpace.company.toLocaleLowerCase()}-${this.coopSpace.name}`;
            this.coopSpace.members.sort((a, b) => (a.name! < b.name! ? -1 : 1));
          }
          this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(result.assets);
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
          // send the necessary data and remove the user from the member table
          this.coopSpacesService.deleteMember(this.coopSpace!.name, member).subscribe({
            next: () => {
              this.memberDatasource = this.memberDatasource.filter(m => m.id !== member.id);
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

  // change the role of a user and thereby its respective rights
  public onRoleChange(originalRole: string, member: Member): void {
    this.uiService
      .confirm(
        `${member.name}`,
        translate('dataManagement.coopSpaces.details.dialog.changeMemberRoleConfirmationQuestion'),
        {
          buttonLabels: 'confirm',
          confirmButtonColor: 'primary',
        }
      )
      .subscribe(result => {
        if (result) {
          // send the necessary data, originalRole must be included for finding the appropiate Keycloak group and deleting the user from it
          this.coopSpacesService.changeMemberRole(this.coopSpace!.id!, originalRole, member).subscribe({
            next: () => {
              this.uiService.showSuccessMessage(
                translate('dataManagement.coopSpaces.details.dialog.changeMemberRoleConfirmationText')
              );
            },
            error: () => {
              this.uiService.showErrorMessage(
                translate('dataManagement.coopSpaces.details.dialog.changeMemberRoleErrorText')
              );
            },
          });
        } else {
          member.role = fromStringToCoopSpaceRole(originalRole);
        }
      });
  }

  public openSettings(): void {
    throw Error('Not yet implemented');
  }

  public addTool(): void {
    throw Error('Not yet implemented');
  }

  public onFileSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in addFile().');

    this.isLoading = true;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket).subscribe({
      complete: () => this.handleUploadSuccess(),
      error: () =>
        this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.uploadFileError')),
    });
  }

  public deleteAsset(asset: GeneralPurposeAsset): void {
    this.uiService
      .confirm(`${asset.name}`, translate('dataManagement.coopSpaces.details.dialog.deleteConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.coopSpaces.details.dialog.deleteConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'warn',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        let bucket = this.bucket;
        if (bucket == null) throw Error('Bucket was null in deleteAsset().');
        this.bucketService.deleteAsset(bucket, asset.name).subscribe({
          next: () => this.handleDeleteSuccess(),
          complete: () => this.updateAssets(asset),
          error: err => this.handleDeleteError(err),
        });
      });
  }

  private updateAssets(asset: GeneralPurposeAsset): void {
    this.datasetDatasource.data = this.datasetDatasource.data.filter(e => e.name !== asset.name);
  }

  public addMember(membersSelected: Member[]): void {
    this.coopSpacesService.addMember(this.coopSpace?.id!, membersSelected).subscribe({
      complete: () => {
        this.reloadMembersListAndUpdateMembersDataSource();
        this.uiService.showSuccessMessage(
          translate('dataManagement.coopSpaces.details.dialog.addMemberConfirmationText')
        );
      },
      error: () => {
        this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.addMemberErrorText'));
      },
    });
  }

  private reloadMembersListAndUpdateMembersDataSource() {
    const currentCoopSpaceId = this.coopSpace?.id!;
    if (currentCoopSpaceId) {
      this.coopSpacesService
        .getMembersOfCoopSpace(currentCoopSpaceId)
        .subscribe(members => (this.memberDatasource = members));
    }
  }

  public openAddMembersAfterwardsDialog(): void {
    const dialogRef = this.dialog.open(AddMembersAfterwardsDlgComponent, {
      data: this.coopSpace,
      minWidth: '60em',
      panelClass: 'resizable',
    });

    dialogRef.componentInstance.membersSelected.subscribe((membersSelected: Member[]) => {
      this.addMember(membersSelected);
      dialogRef.close(); // close the dialog when the user clicks on save
    });

    dialogRef.componentInstance.cancelEvent.subscribe(() => {
      dialogRef.close(); // close the dialog when the user clicks on cancel
    });
  }

  public onMore(): void {
    throw Error('Not yet implemented');
  }

  public onTogglePlay(): void {
    throw Error('Not yet implemented');
  }

  public getUserRole(): CoopSpaceRole | undefined {
    let member = this.coopSpace?.members.find(m => m.username === this.userName);
    if (member === undefined) return undefined;
    return member.role;
  }

  public isAdmin(): boolean {
    return this.getUserRole() === CoopSpaceRole.Admin;
  }

  public handleDeleteMemberSuccess(): void {
    this.uiService.showSuccessMessage(
      translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationText')
    );
  }

  public handleDeleteMemberError(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteMemberErrorText'));
  }

  private handleUploadSuccess(): void {
    this.isLoading = false;

    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.uploadedFile'));
    if (this.bucket) {
      this.coopSpacesService
        .getAssets(this.coopSpace?.id!)
        .pipe(untilDestroyed(this))
        .subscribe(assets => this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets));
    }
  }

  private prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets: GeneralPurposeAsset[]): void {
    assets.forEach(asset => {
      // convert the displayed file size
      asset.size = prettyPrintFileSize(parseInt(asset.size));
    });
    this.datasetDatasource.data = assets;
  }

  public handleDeleteSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteConfirmationText'));
  }

  public handleDeleteError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.deleteErrorText') + err.status);
  }
}
