import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, filter, forkJoin, map, switchMap, tap } from 'rxjs';
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
import { LoadingType } from '../../buckets/assets/assets.component';
import { FileElement } from 'src/app/shared/model/file-element';
import { DatePipe } from '@angular/common';

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
  public datasetDatasource: MatTableDataSource<FileElement> = new MatTableDataSource();
  public memberDatasource: MatTableDataSource<Member> = new MatTableDataSource();

  public userName: string | undefined;
  public fullName: string | undefined;
  public membersSelected: Member[] = [];
  public originalRole: string = '';
  public roles: CoopSpaceRole[] = $enum(CoopSpaceRole).getValues();

  public bucket?: string;
  public isUploading = false;
  public isDeletingAsset: boolean = false;
  public isDeletingMember: boolean = false;
  public isAddingMember: boolean = false;
  public currentLoadingType: LoadingType = LoadingType.NotLoading;
  public currentRoot: string = '';
  public assetsInBucket: GeneralPurposeAsset[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private bucketService: BucketService,
    private datePipe: DatePipe
  ) { }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id =>
          this.coopSpacesService.getCoopSpaceById(id).pipe(
            tap(coopSpace => (this.memberDatasource.data = coopSpace.members)),
            concatMap(coopSpace =>
              this.coopSpacesService.getAssets(coopSpace.id!, '').pipe(map(assets => ({ coopSpace, assets })))
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
          this.isDeletingMember = true;
          this.coopSpacesService.deleteMember(this.coopSpace!.name, member).subscribe({
            next: () => {
              this.memberDatasource.data = this.memberDatasource.data.filter(m => m.id !== member.id);
              this.uiService.showSuccessMessage(
                translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationText')
              );
              this.isDeletingMember = false;
            },
            error: () => {
              this.uiService.showErrorMessage(
                translate('dataManagement.coopSpaces.details.dialog.deleteMemberErrorText')
              );
              this.isDeletingMember = false;
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

  public onFileOrFolderSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in onFileSelected().');

    this.currentLoadingType = LoadingType.UploadingAsset;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket, this.currentRoot).subscribe({
      complete: () => this.handleUploadSuccess(),
      error: () => this.handleUploadError(),
    });
  }

  public deleteElement(element: FileElement): void {
    if (element.isFolder) {
      this.deleteFolder(element);
    } else {
      const asset: GeneralPurposeAsset = element.asset!;
      this.uiService
        .confirm(`${asset.name}`, translate('dataManagement.coopSpaces.details.dialog.deleteAssetConfirmationQuestion'), {
          // TODO: This argument isn't used anywhere.
          confirmationText: translate('dataManagement.coopSpaces.details.dialog.deleteAssetConfirmationText'),
          buttonLabels: 'confirm',
          confirmButtonColor: 'warn',
        })
        .subscribe((userConfirmed: boolean) => {
          if (!userConfirmed) return;
          this.currentLoadingType = LoadingType.DeletingAsset;
          let bucket = this.bucket;
          if (bucket == null) throw Error('Bucket was null in deleteAsset().');
          this.bucketService.deleteAsset(bucket, asset.name).subscribe({
            next: () => this.handleDeleteSuccess(asset.name),
            complete: () => this.updateAssets(asset),
            error: err => this.handleDeleteError(err),
          });
        });
    }
  }

  private deleteFolder(element: FileElement) {
    let folder = `${this.currentRoot}${element.name}/`;
    let bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in deleteAsset().');
    const coopSpace = this.coopSpace

    this.uiService
      .confirm(`${element.name}`, translate('dataManagement.coopSpaces.details.dialog.deleteFolderConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.coopSpaces.details.dialog.deleteFolderConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'warn',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        this.coopSpacesService.getAssets(this.coopSpace?.id!, folder).pipe(map(assets => ({ coopSpace, assets })))
          .subscribe(result => {
            this.currentLoadingType = LoadingType.DeletingAsset;
            const deleteAssetObservables = result.assets.map(assetToBeDeleted =>
              this.bucketService.deleteAsset(bucket!, `${assetToBeDeleted.name}`)
            );
            forkJoin(deleteAssetObservables).subscribe( {
              next: () => this.handleDeleteSuccess(folder),
              complete: () => this.updateFolder(element),
              error: err => this.handleDeleteError(err),
            });
          });
      }
      )
  }

  private updateAssets(asset: GeneralPurposeAsset): void {
    this.datasetDatasource.data = this.datasetDatasource.data.filter(e => e.name !== asset.name);
    this.isDeletingAsset = false;
  }

  private updateFolder(element: FileElement) {
    this.datasetDatasource.data = this.datasetDatasource.data.filter(e => e.name !== element.name)
  }

  public addMember(membersSelected: Member[]): void {
    this.isAddingMember = true;
    this.coopSpacesService.addMember(this.coopSpace?.id!, membersSelected).subscribe({
      complete: () => {
        this.reloadMembersListAndUpdateMembersDataSource();
        this.uiService.showSuccessMessage(
          translate('dataManagement.coopSpaces.details.dialog.addMemberConfirmationText')
        );
        this.isAddingMember = false;
      },
      error: () => {
        this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.addMemberErrorText'));
        this.isAddingMember = false;
      },
    });
  }

  private reloadMembersListAndUpdateMembersDataSource() {
    const currentCoopSpaceId = this.coopSpace?.id!;
    if (currentCoopSpaceId) {
      this.coopSpacesService
        .getMembersOfCoopSpace(currentCoopSpaceId)
        .subscribe(members => (this.memberDatasource.data = members));
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
    this.isUploading = false;

    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.uploadedFile'));
    if (this.bucket) {
      this.coopSpacesService
        .getAssets(this.coopSpace?.id!, this.currentRoot)
        .pipe(untilDestroyed(this))
        .subscribe(assets => this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets));
    }
  }
  private handleUploadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.uploadFileError'));
  }

  private prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets: GeneralPurposeAsset[]): void {
    assets.forEach(asset => {
      // convert the displayed file size
      asset.size = prettyPrintFileSize(parseInt(asset.size));
    });
    this.assetsInBucket = assets;
    this.datasetDatasource.data = this.filterFileElementsByFolderName(this.currentRoot);
  }

  public handleDeleteSuccess(asset: string): void {
    this.currentLoadingType = LoadingType.NotLoading
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteConfirmationText'));

    this.assetsInBucket = this.assetsInBucket.filter(assetInBucket => assetInBucket.name !== asset);

    const leftoverFileElements_files: FileElement[] = this.datasetDatasource.data
      .filter(fileElement => !fileElement.isFolder)
      .filter(fileElement => fileElement.asset!.name !== asset);

    // Remove trailing slash from asset string, if any
    const actualFolderName = asset.replace(/\/$/, '');

    // Get the last part of the asset string after the last / character
    const lastSeparatorIndex = actualFolderName.lastIndexOf('/');
    const deletedFolderName = lastSeparatorIndex !== -1 ? actualFolderName.substring(lastSeparatorIndex + 1) : actualFolderName;
    const coopSpace = this.coopSpace;
    
    this.coopSpacesService.getAssets(this.coopSpace?.id!, deletedFolderName).pipe(
      map(assets => ({ coopSpace, assets }))
    ).subscribe(result => {
      const remainingAssets = result.assets.map(asset => asset.name);
      const filteredAssets = this.assetsInBucket.filter(asset => {
        // Check if the asset is not part of the deleted folder or its sub-folders
        return !remainingAssets.some(deletedAssetName => {
          return asset.name.startsWith(deletedAssetName + '/') ||
                 asset.name !== deletedAssetName;
        });
      });
      this.assetsInBucket = filteredAssets;
    });
    
    // Filter out folders that have the same name as the deleted folder
    const leftoverFileElements_folders: FileElement[] = this.datasetDatasource.data.filter(
      fileElement => fileElement.isFolder && fileElement.name !== deletedFolderName
    );

    this.datasetDatasource.data = leftoverFileElements_files.concat(leftoverFileElements_folders);

    // if folder contains no subfolder and no assets after deleting asset
    // navigate up and delete this folder
    if (!leftoverFileElements_folders.length && !leftoverFileElements_files.length) {
      var toOpenFolderName: string = '';
      const lastSlashIndex = this.currentRoot.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        var secondToLastSlashIndex = this.currentRoot.lastIndexOf('/', lastSlashIndex - 1);
        toOpenFolderName =
          secondToLastSlashIndex === -1
            ? this.currentRoot.slice(0, lastSlashIndex)
            : this.currentRoot.slice(secondToLastSlashIndex + 1, lastSlashIndex);
      }

      this.navigateBackAndRemoveFolder(toOpenFolderName);
    }
  }

  public handleDeleteError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.deleteErrorText') + err.status);
    this.isDeletingAsset = false;
  }

  public openIfFolder(row: FileElement): void {
    if (!row.isFolder) return;

    const toOpenFolderName: string = this.currentRoot + row.name + '/';

    const filteredFileElements: FileElement[] = this.filterFileElementsByFolderName(toOpenFolderName);
    this.currentRoot = toOpenFolderName;
    this.datasetDatasource.data = filteredFileElements;
  }

  private filterFileElementsByFolderName(toOpenFolderName: string): FileElement[] {
    const files: FileElement[] = this.assetsInBucket
      .filter(asset => asset.name.startsWith(toOpenFolderName))
      .filter(asset => !asset.name.slice(toOpenFolderName.length).includes('/'))
      .map(
        asset =>
        ({
          isFolder: false,
          name: asset.name.slice(toOpenFolderName.length),
          asset: asset,
        } as FileElement)
      );

    var folders: FileElement[] = [];
    var folderNames = new Set();
    this.assetsInBucket
      .filter(asset => asset.name.startsWith(toOpenFolderName))
      .filter(asset => asset.name.slice(toOpenFolderName.length).includes('/'))
      .map(asset => asset.name.slice(toOpenFolderName.length).split('/')[0])
      .forEach(folderName => folderNames.add(folderName));

    folderNames.forEach(folderName =>
      folders.push({
        isFolder: true,
        name: folderName,
      } as FileElement)
    );

    return files.concat(folders);
  }

  public navigateBack(): void {
    const lastSlashIndex = this.currentRoot.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      var secondToLastSlashIndex = this.currentRoot.lastIndexOf('/', lastSlashIndex - 1);
      var toOpenFolderName: string =
        secondToLastSlashIndex === -1 ? '' : this.currentRoot.slice(0, secondToLastSlashIndex + 1);

      const filteredFileElements: FileElement[] = this.filterFileElementsByFolderName(toOpenFolderName);
      this.currentRoot = toOpenFolderName;
      this.datasetDatasource.data = filteredFileElements;
    }
  }

  public navigateBackAndRemoveFolder(folder: string): void {
    this.navigateBack();

    if (!folder) return;

    const files: FileElement[] = this.datasetDatasource.data.filter(fileElement => !fileElement.isFolder);
    const filteredFolders: FileElement[] = this.datasetDatasource.data
      .filter(fileElement => fileElement.isFolder)
      .filter(fileElement => fileElement.name !== folder);
    this.datasetDatasource.data = files.concat(filteredFolders);
  }

  // MAT TABLE VALUE FORMATTING
  public formatSize(value: string | undefined): string {
    if (!value) return '';
    return value;
  }

  public formatDate(value: string | undefined): string {
    if (!value) return '';
    const date = this.datePipe.transform(value, 'yyyy-MM-dd');
    return date ? date : '';
  }

  public formatIsPublished(value: boolean | null): string {
    if (value === null) return '';
    return value ? translate('common.yes') : translate('common.no');
  }

}

