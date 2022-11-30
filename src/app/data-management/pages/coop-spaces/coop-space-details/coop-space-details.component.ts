import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, filter, map, switchMap } from 'rxjs';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { CoopSpaceAsset } from 'src/app/shared/model/coopSpaceAsset';
import { CoopSpacesService } from '../coop-spaces.service';

@Component({
  selector: 'app-coop-space-details',
  templateUrl: './coop-space-details.component.html',
  styleUrls: ['./coop-space-details.component.scss'],
})
export class CoopSpaceDetailsComponent implements OnInit {
  public coopSpace?: CoopSpace;

  public displayedColumnsMember: string[] = ['name', 'company', 'role', 'more'];
  public displayedColumnsDataset: string[] = ['name', 'date', 'more'];
  public datasetDatasource: CoopSpaceAsset[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private coopSpacesService: CoopSpacesService) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter(paramMap => paramMap.has('id')),
        map(paramMap => parseInt(paramMap.get('id')!, 10)),
        switchMap(id =>
          this.coopSpacesService
            .getCoopSpaceById(id)
            .pipe(
              concatMap(coopSpace =>
                this.coopSpacesService.getAssets(coopSpace.id!).pipe(map(assets => ({ coopSpace, assets })))
              )
            )
        )
      )
      .subscribe(result => {
        if (result.coopSpace != null) {
          this.coopSpace = result.coopSpace;
        } else {
          this.router.navigateByUrl('/coopspaces');
        }
        this.datasetDatasource = result.assets;
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
