import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {concatMap, filter, forkJoin, map, switchMap, tap} from 'rxjs';
import {CoopSpace, CoopSpaceRole, fromStringToCoopSpaceRole} from 'src/app/shared/model/coop-spaces';
import {GeneralPurposeAsset} from 'src/app/shared/model/general-purpose-asset';
import {CoopSpacesService} from '../coop-spaces.service';
import {Member} from 'src/app/shared/model/member';
import {UIService} from 'src/app/shared/services/ui.service';
import {translate} from '@ngneat/transloco';
import {AuthenticationService} from 'src/app/core/authentication/authentication.service';
import {AddMembersAfterwardsDlgComponent} from './add-members-afterwards-dlg/add-members-afterwards-dlg.component';
import {MatDialog} from '@angular/material/dialog';
import {$enum} from 'ts-enum-util';
import {prettyPrintFileSize} from 'src/app/shared/utils/convert-utils';
import {BucketService} from '../../buckets/bucket.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {MatTableDataSource} from '@angular/material/table';
import {FileElement} from 'src/app/shared/model/file-element';
import {DatePipe} from '@angular/common';

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
  public currentRoot: string = '';
  public assetsInBucket: GeneralPurposeAsset[] = [];

  public currentLoadingType: LoadingType = LoadingType.NotLoading;

  public isAddingMember: boolean = false;
  public isDeletingMember: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private bucketService: BucketService,
    private datePipe: DatePipe
  ) {
  }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id =>
          this.coopSpacesService.getCoopSpaceById(id).pipe(
            tap(coopSpace => (this.memberDatasource.data = coopSpace.members)),
            concatMap(coopSpace =>
              this.coopSpacesService.getAssets(coopSpace.id!, '').pipe(map(assets => ({coopSpace, assets})))
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
              this.handleDeleteMemberSuccess()
            },
            error: () => {
              this.handleDeleteMemberError()
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
          // send the necessary data, originalRole must be included for finding the appropriate Keycloak group and deleting the user from it
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

  public onFileOrFolderSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in onFileSelected().');

    this.currentLoadingType = LoadingType.UploadingAsset;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket, this.currentRoot).subscribe({
      complete: () => this.handleUploadSuccess(),
      error: () => this.handleUploadError(),
    });
  }

  public deleteFileOrFolder(element: FileElement): void {
    let bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in deleteAsset().');
    if (element.isFolder) {
      this.deleteFolder(element, bucket);
    } else {
      this.deleteAsset(element, bucket);
    }
  }

  private deleteAsset(element: FileElement, bucket: string): void {
    this.uiService
      .confirm(
        `${element.name}`,
        translate('dataManagement.coopSpaces.details.dialog.deleteAssetConfirmationQuestion'),
        {
          // TODO: This argument isn't used anywhere.
          confirmationText: translate('dataManagement.coopSpaces.details.dialog.deleteAssetConfirmationText'),
          buttonLabels: 'confirm',
          confirmButtonColor: 'warn',
        }
      )
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        this.currentLoadingType = LoadingType.DeletingAsset;
        this.bucketService.deleteAsset(bucket, this.currentRoot + element.name).subscribe({
          next: () => this.handleDeleteSuccess(element),
          complete: () => this.updateAssets(element),
          error: err => this.handleDeleteError(err),
        });
      });
  }

  private deleteFolder(element: FileElement, bucket: string): void {
    let folder = `${this.currentRoot}${element.name}/`;
    const coopSpace = this.coopSpace;
    this.uiService
      .confirm(
        `${element.name}`,
        translate('dataManagement.coopSpaces.details.dialog.deleteFolderConfirmationQuestion'),
        {
          // TODO: This argument isn't used anywhere.
          confirmationText: translate('dataManagement.coopSpaces.details.dialog.deleteFolderConfirmationText'),
          buttonLabels: 'confirm',
          confirmButtonColor: 'warn',
        }
      )
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        this.currentLoadingType = LoadingType.DeletingAsset;
        this.coopSpacesService
          .getAssets(this.coopSpace?.id!, folder)
          .pipe(map(assets => ({coopSpace, assets})))
          .subscribe(result => {
            const deleteAssetObservables = result.assets.map(assetToBeDeleted =>
              this.bucketService.deleteAsset(bucket!, `${assetToBeDeleted.name}`)
            );
            forkJoin(deleteAssetObservables).subscribe({
              next: () => this.handleDeleteSuccess(element),
              complete: () => this.updateFolder(element),
              error: err => this.handleDeleteError(err),
            });
          });
      });
  }

  public downloadFileOrFolder(element: FileElement): void {
    let bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in downloadFileOrFolder().');
    if (element.isFolder) {
      this.downloadFolder(element, bucket);
    } else {
      this.downloadAsset(element, bucket);
    }
  }

  public downloadAsset(element: FileElement, bucket: string): void {
    this.currentLoadingType = LoadingType.DownloadingAsset;

    this.bucketService.downloadAsset(bucket, this.currentRoot + element.name).subscribe({
      next: data => {
        // create a blob object from the API response
        let blob = new Blob([data], {type: 'application/octet-stream'});

        this.createDownloadURL(blob, element.name);
        this.handleDownloadSuccess();
      },
      error: () => {
        this.handleDownloadError();
      },
    });
  }

  public downloadFolder(element: FileElement, bucket: string): void {
    this.currentLoadingType = LoadingType.DownloadingAsset;

    this.bucketService.downloadFolder(bucket, this.currentRoot + element.name).subscribe({
      next: data => {
        // create a blob object from the API response
        let blob = new Blob([data], {type: 'application/zip'});

        this.createDownloadURL(blob, element.name);
        this.handleDownloadSuccess();
      },
      error: () => {
        this.handleDownloadError();
      },
    });
  }

  private updateAssets(element: FileElement): void {
    this.datasetDatasource.data = this.datasetDatasource.data.filter(e => e.name !== element.name);
    this.currentLoadingType = LoadingType.NotLoading;
  }

  private updateFolder(element: FileElement): void {
    this.datasetDatasource.data = this.datasetDatasource.data.filter(e => e.name !== element.name);
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

  private reloadMembersListAndUpdateMembersDataSource(): void {
    const coopSpaceName = this.coopSpace?.name;
    if (coopSpaceName == null) throw Error("coopSpaceName was null")
    this.coopSpacesService
      .getMembersOfCoopSpace(coopSpaceName)
      .subscribe(members => (this.memberDatasource.data = members));
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

  public getUserRole(): CoopSpaceRole | undefined {
    let member = this.coopSpace?.members.find(m => m.username === this.userName);
    if (member === undefined) return undefined;
    return member.role;
  }

  public isAdmin(): boolean {
    return this.getUserRole() === CoopSpaceRole.Admin;
  }

  private createDownloadURL(blob: Blob, name: string): void {
    // create a temporary URL for the blob object
    let url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', name);
    link.setAttribute('target', '_blank');
    link.click();

    window.URL.revokeObjectURL(url);
  }

  public handleDeleteMemberSuccess(): void {
    this.uiService.showSuccessMessage(
      translate('dataManagement.coopSpaces.details.dialog.deleteMemberConfirmationText')
    );

    this.isDeletingMember = false
  }

  public handleDeleteMemberError(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteMemberErrorText'));

    this.isDeletingMember = false
  }

  private handleUploadSuccess(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.uploadedFile'));
    if (this.bucket) {
      this.coopSpacesService
        .getAssets(this.coopSpace?.id!, '')
        .pipe(untilDestroyed(this))
        .subscribe(assets => this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets));
    }
  }

  private handleUploadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.uploadFileError'));
  }

  private handleDownloadSuccess(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    // show success message
    this.uiService.showSuccessMessage('dataManagement.coopSpaces.details.dialog.downloadAssetConfirmationText');
  }

  private handleDownloadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    // show error message
    this.uiService.showErrorMessage(translate('dataManagement.coopSpaces.details.dialog.downloadAssetErrorText'));
  }

  private prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets: GeneralPurposeAsset[]): void {
    assets.forEach(asset => {
      // convert the displayed file size
      asset.size = prettyPrintFileSize(parseInt(asset.size));
    });
    this.assetsInBucket = assets;
    this.datasetDatasource.data = this.filterFileElementsByFolderName(this.currentRoot);
  }

  public handleDeleteSuccess(element: FileElement): void {
    this.currentLoadingType = LoadingType.NotLoading;
    this.uiService.showSuccessMessage(translate('dataManagement.coopSpaces.details.dialog.deleteConfirmationText'));

    this.assetsInBucket = this.assetsInBucket.filter(assetInBucket => assetInBucket.name !== element.name);

    const deletedElementName = element.isFolder ? element.name.replace(/\/$/, '') : element.name;

    // Filter out folders that have the same name as the deleted folder
    const leftoverFileElements_folders: FileElement[] = this.datasetDatasource.data.filter(
      fileElement => fileElement.isFolder && fileElement.name !== deletedElementName
    );

    // Filter out the deleted element and its sub-folders
    const leftoverFileElements_files: FileElement[] = this.datasetDatasource.data
      .filter(fileElement => !fileElement.isFolder)
      .filter(fileElement => fileElement.asset!.name !== deletedElementName);

    // Update the view by reloading all elements based on the given condition
    this.coopSpacesService.getAssets(this.coopSpace?.id!, '').subscribe(assets => {
      this.assetsInBucket = assets.filter(asset => {
        // Check if the asset is not part of the deleted element or its sub-folders
        return !asset.name.startsWith(deletedElementName + '/');
      });
    });

    this.datasetDatasource.data = leftoverFileElements_files.concat(leftoverFileElements_folders);

    // if folder contains no sub folder and no assets after deleting asset
    // navigate up and delete this folder
    if (!leftoverFileElements_folders.length && !leftoverFileElements_files.length) {
      let toOpenFolderName: string = '';
      const lastSlashIndex = this.currentRoot.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const secondToLastSlashIndex = this.currentRoot.lastIndexOf('/', lastSlashIndex - 1);
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
    this.currentLoadingType = LoadingType.NotLoading;
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

    let folders: FileElement[] = [];
    let folderNames = new Set();
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
      const secondToLastSlashIndex = this.currentRoot.lastIndexOf('/', lastSlashIndex - 1);
      const toOpenFolderName: string =
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
}

// TODO rename or unionize with other LoadingTypes in asset.component.ts
enum LoadingType {
  NotLoading = 'NOT_LOADING',
  UploadingAsset = 'UPLOADING_ASSET',
  DeletingAsset = 'DELETING_ASSET',
  DownloadingAsset = 'DOWNLOADING_ASSET',
}
