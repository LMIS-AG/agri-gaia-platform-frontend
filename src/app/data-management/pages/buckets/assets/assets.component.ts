import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { Dataset } from 'src/app/shared/model/dataset';
import { CoopSpacesService } from '../../coop-spaces/coop-spaces.service';
import { PublishAssetsDlgComponent } from './publish-assets-dlg/publish-assets-dlg.component';

// TODO get mock data from service in future
const MOCK_DATA_DATASET: Dataset[] = [
  {
    id: 1,
    name: 'Feld12b_Mais',
    date: '01.01.2022',
    labeling: 'qwr5t',
    size: '95 kb',
    coopSpace: 'nicht zugewiesen',
    uploadDate: '02.02.2022',
  },
  {
    id: 2,
    name: 'Bodenbeschaffenheit',
    date: '02.02.2022',
    labeling: 'ctd3x',
    size: '95 kb',
    coopSpace: 'nicht zugewiesen',
    uploadDate: '05.05.2022',
  },
  {
    id: 3,
    name: 'Feld05a_Kartoffeln',
    date: '03.03.2022',
    labeling: 'acds4',
    size: '95 kb',
    coopSpace: 'nicht zugewiesen',
    uploadDate: '05.05.2022',
  },
  {
    id: 4,
    name: 'Feld02c_Roggen',
    date: '04.04.2022',
    labeling: 'w12rt',
    size: '95 kb',
    coopSpace: 'nicht zugewiesen',
    uploadDate: '05.05.2022',
  },
];

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  public coopSpace!: CoopSpace;

  public displayedColumnsDataset: string[] = ['name', 'date', 'labeling'];
  public datasetDatasource: Dataset[] = MOCK_DATA_DATASET;

  constructor(private route: ActivatedRoute, private coopSpacesService: CoopSpacesService, private dialog: MatDialog) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id => this.coopSpacesService.getCoopSpaceById(id))
      )
      .subscribe(coopSpace => {
        if (coopSpace != null) {
          this.coopSpace = coopSpace;
        } else {
          // TODO details not found -> eig error bzw unexpected behaviour/state
          throw Error('Not yet implemented');
        }
      });
  }

  public publishAssets(): void {
    console.log(this.coopSpace); // TODO remove
    // TODO openDialog which informs the user and let him confirm his publish-action
    this.dialog
      .open(PublishAssetsDlgComponent, {
        minWidth: '60em',
        panelClass: 'resizable',
      })
      .afterClosed()
      .subscribe(x => {
        console.log(x); // TODO remove log
      });
  }
}
