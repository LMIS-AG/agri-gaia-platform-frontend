import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Dataset } from 'src/app/shared/model/dataset';
import { Member } from 'src/app/shared/model/member';
import { CoopSpacesService } from '../coop-spaces.service';

// TODO get mock data from service in future
const MOCK_DATA_MEMBER: Member[] = [
  { id: 1, name: 'Hank Scorpio', company: 'AgBRAIN', role: CoopSpaceRole.Owner },
  { id: 2, name: 'Gerald Entscheider', company: 'Krone', role: CoopSpaceRole.Owner },
  { id: 3, name: 'Max Power', company: 'DFKI', role: CoopSpaceRole.Editor },
  { id: 4, name: 'Emil Liam', company: 'LMIS', role: CoopSpaceRole.Viewer },
  { id: 4, name: 'Emil Liam', company: 'LMIS', role: CoopSpaceRole.Viewer },
  { id: 4, name: 'Emil Liam', company: 'LMIS', role: CoopSpaceRole.Viewer },
  { id: 4, name: 'Emil Liam', company: 'LMIS', role: CoopSpaceRole.Viewer },
  { id: 4, name: 'Emil Liam', company: 'LMIS', role: CoopSpaceRole.Viewer },
];

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
  selector: 'app-coop-space-details',
  templateUrl: './coop-space-details.component.html',
  styleUrls: ['./coop-space-details.component.scss'],
})
export class CoopSpaceDetailsComponent implements OnInit {
  public coopSpace!: CoopSpace;

  public displayedColumnsMember: string[] = ['name', 'company', 'role', 'more'];
  public memberDatasource: Member[] = MOCK_DATA_MEMBER;

  public displayedColumnsDataset: string[] = ['name', 'date', 'labeling', 'more'];
  public datasetDatasource: Dataset[] = MOCK_DATA_DATASET;

  constructor(private route: ActivatedRoute, private router: Router, private coopSpacesService: CoopSpacesService) {}

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

  public openSettings(): void {
    throw Error('Not yet implemented');
  }

  public addTool(): void {
    throw Error('Not yet implemented');
  }

  public addDataset(): void {
    throw Error('Not yet implemented');
  }

  public addMember(): void {
    throw Error('Not yet implemented');
  }

  public onMore(): void {
    throw Error('Not yet implemented');
  }

  public onTogglePlay(): void {
    throw Error('Not yet implemented');
  }

  // TODO
  public getUsedImage(index: number): string {
    let filename = '';
    if (index === 1) {
      filename = 'Bitmap_jupyter_notebook.png';
    }
    if (index === 2) {
      filename = 'Bitmap_harbor_ai.png';
    }
    if (index === 3) {
      filename = 'Bitmap_argo_cd.png';
    }
    return `assets/tools_png/${filename}`;
  }

  public openInFull(): void {
    this.router.navigate(['focus'], {
      relativeTo: this.route,
      state: { datasetDatasource: this.datasetDatasource },
    });
  }
}
