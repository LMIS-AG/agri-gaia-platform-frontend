import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { BucketService } from '../bucket.service';
import { GeneralPurposeAsset } from '../../../../shared/model/general-purpose-asset';
import { UIService } from '../../../../shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { prettyPrintFileSize } from '../../../../shared/utils/convert-utils';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PublishAssetDlgComponent } from './publish-asset-dlg/publish-asset-dlg.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenerateKeysDialogComponent } from 'src/app/shared/components/generate-keys-dialog/generate-keys-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;
  public displayedColumnsDataset: string[] = ['name', 'date', 'size', 'hasAssetjson', 'isPublished', 'more'];
  public dataSource: MatTableDataSource<GeneralPurposeAsset> = new MatTableDataSource();
  public fileToUpload: File | null = null;
  public isLoading = false;
  public currentLoadingType: LoadingType = LoadingType.NotLoading;
  public isDownloading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private bucketService: BucketService,
    private uiService: UIService,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('name')),
        map(paramMap => paramMap.get('name')),
        switchMap(name =>
          this.bucketService.getAssetsByBucketName(name ? name : '', 'assets/').pipe(map(assets => ({ name, assets })))
        )
      )
      .subscribe(result => {
        this.bucket = result.name!;
        this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(result.assets);
      });
  }

  public onFileSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in onFileSelected().');

    this.currentLoadingType = LoadingType.UploadingAsset;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket, 'assets/').subscribe({
      complete: () => this.handleUploadSuccess(),
      error: () => this.handleUploadError(),
    });
  }

  public downloadAsset(asset: GeneralPurposeAsset): void {
    let bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in downloadAsset().');

    this.currentLoadingType = LoadingType.DownloadingAsset;
    this.bucketService.downloadAsset(bucket, 'assets/' + asset.name).subscribe({
      next: data => {
        // create a blob object from the API response
        let blob = new Blob([data], { type: 'application/octet-stream' });

        // create a temporary URL for the blob object
        let url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', asset.name);
        link.setAttribute('target', '_blank');
        link.click();

        window.URL.revokeObjectURL(url);

        // show success message
        this.handleDownloadSuccess();
      },
      error: () => {
        // show error message
        this.handleDownloadError();
      },
    });
  }

  public deleteAsset(asset: GeneralPurposeAsset): void {
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
        this.bucketService.deleteAsset(bucket, 'assets/' + asset.name).subscribe({
          next: () => this.handleDeleteSuccess(),
          complete: () => this.updateAssets(asset),
          error: err => this.handleDeleteError(err),
        });
      });
  }

  public publishAsset(asset: GeneralPurposeAsset): void {
    asset.bucket = this.bucket!;

    this.openPublishAssetDialog(asset)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          // The asset was successfully published, disable the publish button and enable the unpublish button
          asset.isPublished = true;
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
    this.dataSource.data = assets;
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
        .getAssetsByBucketName(this.bucket!, 'assets/')
        .pipe(untilDestroyed(this))
        .subscribe(assets => this.prettyPrintFileSizeOfAssetsAndUpdateDataSource(assets));
    }
  }

  private handleUploadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.uploadFileError'));
  }

  private handleDownloadSuccess(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    // show success message
    this.uiService.showSuccessMessage('dataManagement.buckets.assets.downloadAssetConfirmationText');
  }

  private handleDownloadError(): void {
    this.currentLoadingType = LoadingType.NotLoading;

    // show error message
    this.uiService.showSuccessMessage('dataManagement.buckets.assets.downloadAssetErrorText');
  }

  public handleDeleteSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.deleteConfirmationText'));
  }

  public handleDeleteError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.deleteErrorText') + err.status);
    this.currentLoadingType = LoadingType.NotLoading;
  }
}

enum LoadingType {
  NotLoading = 'NOT_LOADING',
  UploadingAsset = 'UPLOADING_ASSET',
  DeletingAsset = 'DELETING_ASSET',
  GeneratingKeys = 'GENERATING_KEYS',
  DownloadingAsset = 'DOWNLOADING_ASSET',
}
