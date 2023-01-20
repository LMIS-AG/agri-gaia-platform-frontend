import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';
import {removeElementFromArray} from 'src/app/shared/array-utils';
import {CoopSpace, CoopSpaceRole} from 'src/app/shared/model/coop-spaces';
import {Member} from 'src/app/shared/model/member';
import {CoopSpacesService} from './coop-spaces.service';
import {CreateCoopSpaceComponent} from './create-coop-space/create-coop-space.component';
import {AuthenticationService} from 'src/app/core/authentication/authentication.service';

@Component({
  selector: 'app-coop-spaces',
  templateUrl: './coop-spaces.component.html',
  styleUrls: ['./coop-spaces.component.scss'],
})
export class CoopSpacesComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'company', 'member', 'role', 'more'];
  public dataSource: MatTableDataSource<CoopSpace> = new MatTableDataSource<CoopSpace>();

  public userName: string | undefined;

  constructor(
    private dialog: MatDialog,
    private coopSpacesService: CoopSpacesService,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
  }

  public ngOnInit(): void {
    this.authenticationService.userProfile$.subscribe(userProfile => {
      if (userProfile === null) throw Error("userProfile was null.")
      this.userName = userProfile.username;
    });
    this.coopSpacesService.getAll().subscribe((coopSpaces: CoopSpace[]) => {
      this.dataSource.data = coopSpaces;
    });
  }

  public getUserRole(coopSpaceId: number): CoopSpaceRole {
    let coopSpace: CoopSpace | undefined = this.dataSource.data.find(c => c.id === coopSpaceId);
    if (coopSpace === undefined) throw Error(`Could not find coopSpace with id ${coopSpaceId}.`)
    let member = coopSpace.members.find(m => m.username === this.userName)
    if (member === undefined) return CoopSpaceRole.None;
    // return CoopSpaceRole.None;
    return member.role;
  }

  public isAdmin(id: number): boolean {
    return this.getUserRole(id) === "ADMIN";
  }

  public addCoopSpace(): void {
    this.openCreateCoopSpaceDialog(null)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.coopSpacesService.getAll().subscribe(coopSpaces => {
            this.dataSource.data = coopSpaces;
          });
        }
      });
  }

  private openCreateCoopSpaceDialog(coopSpace: CoopSpace | null): MatDialogRef<CreateCoopSpaceComponent, boolean> {
    return this.dialog.open(CreateCoopSpaceComponent, {
      minWidth: '60em',
      panelClass: 'resizable',
      data: coopSpace,
    });
  }

  public openDetails(row: CoopSpace): void {
    this.router.navigate([`${row.id}`], {relativeTo: this.route});
  }

  public onDelete(selectedCoopSpace: CoopSpace): void {
    this.coopSpacesService.delete(selectedCoopSpace).subscribe(() => {
      removeElementFromArray(this.dataSource.data, cs => cs.name === selectedCoopSpace.name);
      this.dataSource.data = this.dataSource.data;
    });
  }
  public membersToString(members: Member[]): string {
    return members.map(m => m.name!).join(', ');
  }
}
