import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, filter, map, switchMap } from 'rxjs';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';
import { CoopSpacesService } from '../coop-spaces.service';
import {removeElementFromArray} from 'src/app/shared/array-utils';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { translate } from '@ngneat/transloco';


@Component({
  selector: 'app-coop-space-details',
  templateUrl: './coop-space-details.component.html',
  styleUrls: ['./coop-space-details.component.scss'],
})
export class CoopSpaceDetailsComponent implements OnInit {
  public coopSpace?: CoopSpace;

  public displayedColumnsMember: string[] = ['name', 'company', 'role', 'more'];
  public displayedColumnsDataset: string[] = ['name', 'date', 'more'];
  public datasetDatasource: GeneralPurposeAsset[] = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService
    ) {}

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

  public onDeleteMember(member: Member): void {
    this.uiService.confirm(`${member.name}`, translate('dataManagement.coopSpaces.details.dialog.publishConfirmationQuestion'), {
      confirmationText: translate('dataManagement.coopSpaces.details.dialog.publishConfirmationText'),
      buttonLabels: 'confirm',
      confirmButtonColor: 'primary',
    }).subscribe(result => {
      if (result) {

        let role = member.role.toLowerCase();
        role = role.charAt(0).toUpperCase() + role.slice(1);

        this.coopSpacesService.deleteMember(member.id!, member.username, role, this.coopSpace!.name, this.coopSpace!.company)
          .subscribe(() => {
            this.coopSpace!.members = this.coopSpace!.members.filter(m => m.id !== member.id);
          });
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

  public openInFull(): void {
    this.router.navigate(['focus'], {
      relativeTo: this.route,
      state: { datasetDatasource: this.datasetDatasource },
    });
  }
}
