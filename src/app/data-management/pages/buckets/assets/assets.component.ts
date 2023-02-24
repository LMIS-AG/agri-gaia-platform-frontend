import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, finalize, map, Subscription, switchMap } from 'rxjs';
import { BucketService } from '../bucket.service';
import { GeneralPurposeAsset } from '../../../../shared/model/coopSpaceAsset';
import { UIService } from '../../../../shared/services/ui.service';
import { translate } from '@ngneat/transloco';
import { prettyPrintFileSize } from '../../../../shared/utils/convert-utils';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;
  public displayedColumnsDataset: string[] = ['name', 'date', 'size', 'more'];
  public dataSource: GeneralPurposeAsset[] = [];
  public fileToUpload: File | null = null;
  public uploadSub: Subscription | undefined; // TODO do i need this?

  constructor(private route: ActivatedRoute, private bucketService: BucketService, private uiService: UIService) {}

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
          asset.size = prettyPrintFileSize(asset.size);
        });
        this.dataSource = result.assets;
      });
  }

  public onFileSelected(event: any) {
    const bucket = this.bucket;
    if (bucket == null) {
      throw Error('Bucket was null in onFileSelected().');
    }

    const filesToUpload: File[] = event.target.files;

    if (filesToUpload && filesToUpload.length !== 0) {
      const formData = new FormData();

      for (let index = 0; index < filesToUpload.length; index++) {
        const file = filesToUpload[index];
        formData.append('files', file);
      }

      const upload$ = this.bucketService.uploadAsset(bucket, formData).pipe(finalize(() => this.reset()));
      this.uploadSub = upload$.subscribe({
        complete: () => this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.uploadedFile')),
        error: () => this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.uploadFileError')),
      });
    }
  }

  // TODO use this later when adding progress bar in order to make it possibel to cancel the upload
  public cancelUpload(): void {
    this.uploadSub!.unsubscribe(); // TODO check if this causes erros
    this.reset();
  }

  private reset(): void {
    this.uploadSub = undefined;
  }

  public publishAsset(element: GeneralPurposeAsset): void {
    this.uiService
      .confirm(`${element.name}`, translate('dataManagement.buckets.assets.dialog.publishConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.buckets.assets.dialog.publishConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'primary',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) {
          return;
        }
        let bucket = this.bucket;
        if (bucket == null) {
          throw Error('Bucket was null in publishAsset().');
        }
        this.bucketService.publishAsset(bucket, element.name).subscribe({
          next: response => this.handlePublishSuccess(response),
          error: err => this.handlePublishError(err),
        });
      });
  }

  public unpublishAsset(element: GeneralPurposeAsset): void {
    this.uiService
      .confirm(`${element.name}`, translate('dataManagement.buckets.assets.dialog.unpublishConfirmationQuestion'), {
        // TODO: This argument isn't used anywhere.
        confirmationText: translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'warn',
      })
      .subscribe((userConfirmed: boolean) => {
        if (!userConfirmed) return;
        let bucket = this.bucket;
        if (bucket == null) throw Error('Bucket was null in unpublishAsset().');
        this.bucketService.unpublishAsset(bucket, element.name).subscribe({
          next: response => this.handleUnpublishSuccess(response),
          error: err => this.handleUnpublishError(err),
        });
      });
  }
  public handlePublishSuccess(response: HttpResponse<unknown>): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.publishConfirmationText'));
  }

  public handlePublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.publishErrorText') + err.status);
  }

  public handleUnpublishSuccess(response: HttpResponse<unknown>): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'));
  }

  public handleUnpublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.unpublishErrorText') + err.status);
  }
}
