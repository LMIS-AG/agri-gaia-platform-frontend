import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, forkJoin, map, switchMap } from 'rxjs';
import { BucketService } from '../bucket.service';
import { FileElement } from '../../../../shared/model/file-element';
import { GeneralPurposeAsset } from '../../../../shared/model/general-purpose-asset';
import { UIService } from '../../../../shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { prettyPrintFileSize } from '../../../../shared/utils/convert-utils';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PublishAssetDlgComponent } from './publish-asset-dlg/publish-asset-dlg.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenerateKeysDialogComponent } from 'src/app/shared/components/generate-keys-dialog/generate-keys-dialog.component';
import { DatePipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;
  public displayedColumnsDataset: string[] = ['name', 'date', 'size', 'isPublished', 'more'];
  public dataSource: MatTableDataSource<FileElement> = new MatTableDataSource();
  public fileToUpload: File | null = null;
  public currentLoadingType: LoadingType = LoadingType.NotLoading;
  public assetsInBucket: GeneralPurposeAsset[] = [];
  public currentRoot: string = '';

  constructor(
    private route: ActivatedRoute,
    private bucketService: BucketService,
    private uiService: UIService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('name')),
        map(paramMap => paramMap.get('name')),
        switchMap(name =>
          this.bucketService.getAssetsByBucketName(name ? name : '', 'assets').pipe(map(assets => ({ name, assets })))
        )
      )
      .subscribe(result => {
        this.bucket = result.name!;
        this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(result.assets);
      });
  }

  public onFileOrFolderSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in onFileSelected().');

    this.currentLoadingType = LoadingType.UploadingAsset;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket).subscribe({
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
        .confirm(`${asset.name}`, translate('dataManagement.buckets.assets.dialog.deleteConfirmationQuestion'), {
          // TODO: This argument isn't used anywhere.
          confirmationText: translate('dataManagement.buckets.assets.dialog.deleteConfirmationText'),
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
    let folder = `assets/${element.name}/`;
    let bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in deleteAsset().');
    
    this.bucketService.getAssetsByBucketName(bucket, folder).pipe(map(assets => ({ bucket, assets })))
    .subscribe(result => {
      const deleteAssetObservables = result.assets.map(assetToBeDeleted =>
        this.bucketService.deleteAsset(bucket!, `${assetToBeDeleted.name}`)
      );
      forkJoin(deleteAssetObservables).subscribe(() => {
      });
      }
    )}

  public publishAsset(asset: GeneralPurposeAsset): void {
    if (!asset) throw Error('asset was null in publishAsset().');
    asset.coopSpace = this.bucket!;

    this.openPublishAssetDialog(asset)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // The asset was successfully published, disable the publish button and enable the unpublish button
          asset.isPublished = true;
        } else {
          // The asset was not published, do nothing
        }
      });
  }

  private openPublishAssetDialog(asset: GeneralPurposeAsset): MatDialogRef<PublishAssetDlgComponent, boolean> {
    return this.dialog.open(PublishAssetDlgComponent, {
      minWidth: '60em',
      panelClass: 'resizable',
      data: asset,
    });
  }

  private updateAssets(asset: GeneralPurposeAsset): void {
    this.dataSource.data = this.dataSource.data.filter(e => e.name !== asset.name);
    this.currentLoadingType = LoadingType.NotLoading;
  }

  public unpublishAsset(asset: GeneralPurposeAsset): void {
    this.uiService
      .confirm(`${asset.name}`, translate('dataManagement.buckets.assets.dialog.unpublishConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'warn',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        let bucket = this.bucket;
        if (bucket == null) throw Error('Bucket was null in unpublishAsset().');
        this.bucketService.unpublishAsset(bucket, asset.name).subscribe({
          next: () => this.handleUnpublishSuccess(asset),
          error: err => this.handleUnpublishError(err),
        });
      });
  }

  public openGenerateKeysDialog(): void {
    this.currentLoadingType = LoadingType.GeneratingKeys;
    // Retrieve the keys and the session token using the BucketService
    this.bucketService.getKeysAndToken().subscribe(result => {
      this.currentLoadingType = LoadingType.NotLoading;
      // Open the GenerateKeysDialogComponent and pass the keys and the session token as data
      this.dialog.open(GenerateKeysDialogComponent, {
        data: {
          accessKey: result.accessKey,
          secretKey: result.secretKey,
          sessionToken: result.sessionToken,
        },
      });
    });
  }

  private prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets: GeneralPurposeAsset[]): void {
    assets.forEach(asset => {
      // convert the displayed file size
      asset.size = prettyPrintFileSize(parseInt(asset.size));
    });
    this.assetsInBucket = assets;
    this.dataSource.data = this.filterFileElementsByFolderName('');
    this.currentRoot = ''; // TODO makes sense? what if I added an asset while being in a subfolder and this is triggered... Maybe i have to adjust root or view again...
  }

  public handlePublishSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.publishConfirmationText'));
  }

  public handlePublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.publishErrorText') + err.status);
  }

  public handleUnpublishSuccess(asset: GeneralPurposeAsset): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'));
    asset.isPublished = false;
  }

  public handleUnpublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.unpublishErrorText') + err.status);
  }

  private handleUploadSuccess(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.uploadedFile'));

    if (this.bucket) {
      this.bucketService
        .getAssetsByBucketName(this.bucket!, 'assets')
        .pipe(untilDestroyed(this))
        .subscribe(assets => this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets));
    }
  }

  private handleUploadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showErrorMessage(translate('ataManagement.buckets.assets.uploadFileError'));
  }

  public handleDeleteSuccess(asset: string): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.deleteConfirmationText'));

    this.assetsInBucket = this.assetsInBucket.filter(assetInBucket => assetInBucket.name !== asset);

    const leftoverFileElements_files: FileElement[] = this.dataSource.data
      .filter(fileElement => !fileElement.isFolder)
      .filter(fileElement => fileElement.asset!.name !== asset);

    const leftoverFileElements_folders: FileElement[] = this.dataSource.data.filter(
      fileElement => fileElement.isFolder
    );

    this.dataSource.data = leftoverFileElements_files.concat(leftoverFileElements_folders);

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
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.deleteErrorText') + err.status);
    this.currentLoadingType = LoadingType.NotLoading;
  }

  public openIfFolder(row: FileElement): void {
    if (!row.isFolder) return;

    const toOpenFolderName: string = this.currentRoot + row.name + '/';

    const filteredFileElements: FileElement[] = this.filterFileElementsByFolderName(toOpenFolderName);
    this.currentRoot = toOpenFolderName;
    this.dataSource.data = filteredFileElements;
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
      this.dataSource.data = filteredFileElements;
    }
  }

  public navigateBackAndRemoveFolder(folder: string): void {
    this.navigateBack();

    if (!folder) return;

    const files: FileElement[] = this.dataSource.data.filter(fileElement => !fileElement.isFolder);
    const filteredFolders: FileElement[] = this.dataSource.data
      .filter(fileElement => fileElement.isFolder)
      .filter(fileElement => fileElement.name !== folder);
    this.dataSource.data = files.concat(filteredFolders);
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

export enum LoadingType {
  NotLoading = 'NOT_LOADING',
  UploadingAsset = 'UPLOADING_ASSET',
  DeletingAsset = 'DELETING_ASSET',
  GeneratingKeys = 'GENERATING_KEYS',
}
