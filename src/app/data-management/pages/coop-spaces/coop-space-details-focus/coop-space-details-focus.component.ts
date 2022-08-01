import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset } from 'src/app/shared/model/dataset';

@Component({
  selector: 'app-coop-space-details-focus',
  templateUrl: './coop-space-details-focus.component.html',
  styleUrls: ['./coop-space-details-focus.component.scss'],
})
export class CoopSpaceDetailsFocusComponent {
  public coopSpaceName: string = '';
  public data: Dataset[] = [];
  public displayedColumnsDataset: string[] = ['name', 'date', 'uploadDate', 'size', 'coopSpace', 'labeling', 'more'];

  constructor(private router: Router, private location: Location) {
    // TODO maybe consider other option of passing or getting the data which is displayed here. Maybe reload data also from Backend. Current solution is easy and does not need it but you cannot reload the page without losing the data.
    if (this.router.getCurrentNavigation()?.extras?.state?.datasetDatasource) {
      this.data = this.router.getCurrentNavigation()?.extras?.state?.datasetDatasource as Dataset[];
    } else {
      this.location.back();
    }
  }

  public addDataset(): void {
    throw Error('Not yet implemented');
  }

  public closeFullscreen(): void {
    this.location.back();
  }

  // TODO this method will maybe never be needed - clarify with KBE
  public navigateToDataManagement(): void {
    throw Error('Not yet implemented');
  }
}
