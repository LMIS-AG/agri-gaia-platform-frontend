import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { CoopSpacesService } from './coop-spaces.service';
import { CreateCoopSpaceComponent } from './create-coop-space/create-coop-space.component';

@Component({
  selector: 'app-coop-spaces',
  templateUrl: './coop-spaces.component.html',
  styleUrls: ['./coop-spaces.component.scss'],
})
export class CoopSpacesComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'company', 'member', 'role', 'more'];
  public dataSource: CoopSpace[] = [];

  constructor(
    private dialog: MatDialog,
    private coopSpacesService: CoopSpacesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.coopSpacesService.getAll().subscribe(coopSpaces => {
      this.dataSource = coopSpaces;
    });
  }

  public addCoopSpace(): void {
    // TODO maybe get firma from keycloak!?
    this.openCreateCoopSpaceDialog(null)
      .afterClosed()
      .subscribe(() => {
        this.coopSpacesService.getAll().subscribe(coopSpaces => {
          this.dataSource = coopSpaces;
        });
      });
  }

  private openCreateCoopSpaceDialog(
    coopSpace: CoopSpace | null
  ): MatDialogRef<CreateCoopSpaceComponent, CoopSpace | null> {
    return this.dialog.open(CreateCoopSpaceComponent, {
      minWidth: '60em',
      panelClass: 'resizable',
      data: coopSpace,
    });
  }

  public openDetails(row: CoopSpace): void {
    this.router.navigate([`${row.id}`], { relativeTo: this.route });
  }

  public onDelete(): void {
    throw Error('Not yet implemented');
  }
}
