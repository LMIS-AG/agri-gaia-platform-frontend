import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';
import { CoopSpacesService } from '../coop-spaces/coop-spaces.service';
import { CreateCoopSpaceComponent } from '../coop-spaces/create-coop-space/create-coop-space.component';

@Component({
  selector: 'app-buckets',
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss'],
})
export class BucketsComponent implements OnInit {
  public displayedColumns: string[] = ['name'];
  public dataSource: CoopSpace[] = [];

  constructor(private coopSpacesService: CoopSpacesService, private router: Router, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.coopSpacesService.getAll().subscribe(coopSpaces => {
      this.dataSource = coopSpaces;
    });
  }

  public openDetails(row: CoopSpace): void {
    this.router.navigate([`${row.id}`], { relativeTo: this.route });
  }
}
