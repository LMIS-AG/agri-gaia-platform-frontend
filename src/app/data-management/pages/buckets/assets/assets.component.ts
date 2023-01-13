import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {catchError, filter, map, switchMap} from 'rxjs';
import {BucketService} from '../bucket.service';
import {GeneralPurposeAsset} from '../../../../shared/model/coopSpaceAsset';
import {UIService} from '../../../../shared/services/ui.service';
import {translate} from '@ngneat/transloco';
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;

  public displayedColumnsDataset: string[] = ['name', 'date', 'more'];
  public dataSource: GeneralPurposeAsset[] = [];

  constructor(
    private route: ActivatedRoute,
    private bucketService: BucketService,
    private dialog: MatDialog,
    private uiService: UIService
  ) {
  }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('name')),
        map(paramMap => paramMap.get('name')),
        switchMap(name =>
          this.bucketService.getAssetsByBucketName(name ? name : '').pipe(map(assets => ({name, assets})))
        )
      )
      .subscribe(result => {
        this.bucket = result.name!;
        this.dataSource = result.assets;
      });
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
        if (!userConfirmed) return;
        let bucket = this.bucket;
        if (bucket == null) throw Error("Bucket was null in publishAsset().");
        this.bucketService.publishAsset(bucket, element.name).subscribe({
          next: response => this.handlePublishSuccess(response),
          error: err => this.handlePublishError(err),
        });
      })
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
        if (bucket == null) throw Error("Bucket was null in unpublishAsset().");
        this.bucketService.unpublishAsset(bucket, element.name).subscribe({
          next: response => this.handleUnpublishSuccess(response),
          error: err => this.handleUnpublishError(err),
        });
      });
  }

  public handlePublishSuccess(response: HttpResponse<unknown>): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.publishConfirmationText'))
  }

  public handlePublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.publishErrorText') + err.status)
  }

  public handleUnpublishSuccess(response: HttpResponse<unknown>): void {
    this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.unpublishConfirmationText'))
  }

  public handleUnpublishError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.buckets.assets.dialog.unpublishErrorText') + err.status)
  }
}
