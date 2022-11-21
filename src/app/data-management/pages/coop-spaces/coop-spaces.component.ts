import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { removeElementFromArray } from 'src/app/shared/array-utils';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { CoopSpacesService } from './coop-spaces.service';
import { CreateCoopSpaceComponent } from './create-coop-space/create-coop-space.component';

@Component({
  selector: 'app-coop-spaces',
  templateUrl: './coop-spaces.component.html',
  styleUrls: ['./coop-spaces.component.scss'],
})
export class CoopSpacesComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'company', 'member', 'role', 'more'];
  public dataSource: MatTableDataSource<CoopSpace> = new MatTableDataSource<CoopSpace>();

  constructor(
    private dialog: MatDialog,
    private coopSpacesService: CoopSpacesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.coopSpacesService.getAll().subscribe(coopSpaces => {
      this.dataSource.data = coopSpaces;
    });
  }

  public addCoopSpace(): void {
    // TODO maybe get firma from keycloak!?
    this.openCreateCoopSpaceDialog(null)
      .afterClosed()
      .subscribe(() => {
        this.coopSpacesService.getAll().subscribe(coopSpaces => {
          this.dataSource.data = coopSpaces;
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

  public onDelete(selectedElement: CoopSpace): void {
    this.coopSpacesService.delete(selectedElement); // TODO call service later when dealing with acutal data instead of mock data
    removeElementFromArray(this.dataSource.data, e => e.name === selectedElement.name);
    // update dataSource
    this.dataSource.data = this.dataSource.data;
  }

  public membersToString(members: Member[]): string {
    return members.map(m => m.username).toString();
  }
}
