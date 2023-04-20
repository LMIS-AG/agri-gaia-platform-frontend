import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { removeElementFromArray } from 'src/app/shared/array-utils';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { CoopSpacesService } from './coop-spaces.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { forkJoin } from 'rxjs';
import { UIService } from 'src/app/shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { BucketService } from '../buckets/bucket.service';
import { CreateCoopSpaceDlgComponent } from './create-coop-space-dlg/create-coop-space-dlg.component';

@Component({
  selector: 'app-coop-spaces',
  templateUrl: './coop-spaces.component.html',
  styleUrls: ['./coop-spaces.component.scss'],
})
export class CoopSpacesComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'company', 'member', 'role', 'more'];
  public dataSource: MatTableDataSource<CoopSpace> = new MatTableDataSource<CoopSpace>();

  public userName: string | undefined;
  public isPerformingDeletion: boolean = false;

  constructor(
    private dialog: MatDialog,
    private coopSpacesService: CoopSpacesService,
    private router: Router,
    private route: ActivatedRoute,
    private uiService: UIService,
    private authenticationService: AuthenticationService,
    private bucketService: BucketService
  ) {}

  public ngOnInit(): void {
    this.authenticationService.userProfile$.subscribe(userProfile => {
      if (userProfile === null) throw Error('userProfile was null.');
      this.userName = userProfile.username;
    });
    this.coopSpacesService.getAll().subscribe((coopSpaces: CoopSpace[]) => {
      this.dataSource.data = coopSpaces;
    });
  }

  public getUserRole(coopSpaceId: number): CoopSpaceRole | null {
    let coopSpace: CoopSpace | undefined = this.dataSource.data.find(c => c.id === coopSpaceId);
    if (coopSpace === undefined) throw Error(`Could not find coopSpace with id ${coopSpaceId}.`);
    let member = coopSpace.members.find(m => m.username === this.userName);
    if (member === undefined) return null;
    return member.role;
  }

  public isAdmin(id: number): boolean {
    return this.getUserRole(id) === 'ADMIN';
  }

  public addCoopSpace(): void {
    this.dialog
      .open(CreateCoopSpaceDlgComponent, {
        minWidth: '60em',
        panelClass: 'resizable',
        data: this.dataSource,
      })
      .afterClosed()
      .subscribe();
  }

  public openDetails(row: CoopSpace): void {
    this.router.navigate([`${row.id}`], { relativeTo: this.route });
  }

  public onDelete(selectedCoopSpace: CoopSpace): void {
    const coopSpaceName = selectedCoopSpace.name
    if (coopSpaceName == null) throw Error("coopSpaceName was null")
    this.coopSpacesService.getAssets(coopSpaceName, '').subscribe(assets => {
      if (assets.length === 0) {
        // No assets found, show confirmation message
        this.uiService
          .confirm(
            `${selectedCoopSpace.name}`,
            translate('dataManagement.coopSpaces.overviewCoopSpaces.dialog.deleteCoopSpaceConfirmationQuestion'),
            {
              buttonLabels: 'confirm',
              confirmButtonColor: 'primary',
            }
          )
          .subscribe(confirmResult => {
            if (confirmResult) {
              this.handleDeletionOfCoopSpace(selectedCoopSpace);
            }
          });
      } else {
        // CoopSpace contains assets, show warning message
        this.uiService
          .confirm(
            translate('dataManagement.coopSpaces.overviewCoopSpaces.dialog.CoopSpaceContainsAssetsText'),
            translate('dataManagement.coopSpaces.overviewCoopSpaces.dialog.deleteCoopSpaceWithAssetsQuestion'),
            {
              buttonLabels: 'confirm',
              confirmButtonColor: 'warn',
            }
          )
          .subscribe(confirmResult => {
            if (confirmResult) {
              const bucket = `prj-${selectedCoopSpace.company.toLocaleLowerCase()}-${selectedCoopSpace.name}`;
              const deleteAssetObservables = assets.map(assetToBeDeleted =>
                this.bucketService.deleteAsset(bucket, assetToBeDeleted.name)
              );
              forkJoin(deleteAssetObservables).subscribe(() => {
                // All assets have been deleted, we can now delete the CoopSpace
                this.handleDeletionOfCoopSpace(selectedCoopSpace);
              });
            }
          });
      }
    });
  }

  private handleDeletionOfCoopSpace(selectedCoopSpace: CoopSpace): void {
    this.isPerformingDeletion = true;
    this.coopSpacesService.delete(selectedCoopSpace).subscribe({
      next: () => {
        this.uiService.showSuccessMessage(
          translate('dataManagement.coopSpaces.overviewCoopSpaces.dialog.deleteCoopSpaceConfirmationText')
        );
        removeElementFromArray(this.dataSource.data, cs => cs.name === selectedCoopSpace.name);
        this.dataSource.data = this.dataSource.data;
        this.isPerformingDeletion = false;
      },
      error: () => {
        this.uiService.showErrorMessage(
          translate('dataManagement.coopSpaces.overviewCoopSpaces.dialog.deleteCoopSpaceErrorText')
        );
        this.isPerformingDeletion = false;
      },
    });
  }

  public adminsToString(members: Member[]): string {
    return members
      .filter(m => m.role === CoopSpaceRole.Admin)
      .map(m => m.name!)
      .join(', ');
  }
}
