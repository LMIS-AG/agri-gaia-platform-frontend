import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { BucketService } from '../bucket.service';
import { CoopSpaceAsset } from '../../../../shared/model/coopSpaceAsset';
import { UIService } from '../../../../shared/services/ui.service';
import { translate } from '@ngneat/transloco';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public bucket?: string;

  public displayedColumnsDataset: string[] = ['name', 'date', 'publish-button'];
  public datasetDatasource: CoopSpaceAsset[] = [];

  constructor(
    private route: ActivatedRoute,
    private bucketService: BucketService,
    private dialog: MatDialog,
    private ui: UIService
  ) {}

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
        this.datasetDatasource = result.assets;
      });
  }

  // TODO Translate texts
  public publishAssets(element: CoopSpaceAsset): void {
    this.ui
      .confirm(`${element.name}`, translate('dataManagement.buckets.assets.dialog.confirmationQuestion'), {
        confirmationText: translate('dataManagement.buckets.assets.dialog.confirmationText'),
        buttonLabels: 'confirm',
        confirmButtonColor: 'primary',
      })
      .subscribe(result => {
        if (result) {
          this.bucketService.publish(this.bucket!, element.name);
        }
      });
  }
}
