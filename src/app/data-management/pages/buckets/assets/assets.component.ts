import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { BucketService } from '../bucket.service';
import { GeneralPurposeAsset } from '../../../../shared/model/coopSpaceAsset';
import { UIService } from '../../../../shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { prettyPrintFileSize } from '../../../../shared/utils/convert-utils';
import { MatTableDataSource } from '@angular/material/table';
import { GenerateKeysComponent } from 'src/app/shared/components/generate-keys/generate-keys.component';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;
  public displayedColumnsDataset: string[] = ['name', 'date', 'size', 'more'];
  public dataSource: MatTableDataSource<GeneralPurposeAsset> = new MatTableDataSource();
  public fileToUpload: File | null = null;
  public isLoading = false;

  constructor(private route: ActivatedRoute, private bucketService: BucketService, private uiService: UIService, private generateKeys: GenerateKeysComponent) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('name')),
        map(paramMap => paramMap.get('name')),
        switchMap(name =>
          this.bucketService.getAssetsByBucketName(name ? name : '').pipe(map(assets => ({ name, assets })))
        )
      )
      .subscribe(result => {
        this.bucket = result.name!;
        result.assets.forEach(asset => {
          // convert the displayed file size
          asset.size = prettyPrintFileSize(parseInt(asset.size));
        });
        this.dataSource.data = result.assets;
      });
  }

  public onFileSelected(event: any): void {
    const bucket = this.bucket;
    if (bucket == null) throw Error('Bucket was null in onFileSelected().');

    this.isLoading = true;
    this.bucketService.buildFormDataAndUploadAssets(event, bucket).subscribe({
      complete: () => this.handleUploadSuccess(),
      error: () => this.uiService.showErrorMessage(translate('ataManagement.buckets.assets.uploadFileError')),
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
        let bucket = this.bucket;
        if (bucket == null) throw Error('Bucket was null in deleteAsset().');
        this.bucketService.deleteAsset(bucket, asset.name).subscribe({
          next: () => this.handleDeleteSuccess(),
          complete: () => this.updateAssets(asset),
          error: err => this.handleDeleteError(err),
        });
      });
  }

  public publishAsset(asset: GeneralPurposeAsset): void {
    this.uiService
      .confirm(`${asset.name}`, translate('dataManagement.buckets.assets.dialog.publishConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.buckets.assets.dialog.publishConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'primary',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        let bucket = this.bucket;
        if (bucket == null) throw Error('Bucket was null in deleteAsset().');
        this.bucketService.publishAsset(bucket, asset.name).subscribe({
          next: () => this.handlePublishSuccess(),
          error: err => this.handlePublishError(err),
        });
      });
  }

  private updateAssets(asset: GeneralPurposeAsset): void {
    this.dataSource.data = this.dataSource.data.filter(e => e.name !== asset.name);
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
          next: () => this.handleUnpublishSuccess(),
          error: err => this.handleUnpublishError(err),
        });
      });
  }

  public generateAccessKeySecretKey() {
    const accessKey = this.generateKeys.accessKey
    const secretKey = this.generateKeys.secretKey
  }

  public handlePublishSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.publishConfirmationText'));
  }

  public handlePublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.publishErrorText') + err.status);
  }

  public handleUnpublishSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'));
  }

  public handleUnpublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.unpublishErrorText') + err.status);
  }

  private handleUploadSuccess(): void {
    this.isLoading = false;

    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.uploadedFile'));
  }

  public handleDeleteSuccess(): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.deleteConfirmationText'));
  }

  public handleDeleteError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.deleteErrorText') + err.status);
  }
}
