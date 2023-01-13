import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bucket } from 'src/app/shared/model/bucket';
import { BucketService } from './bucket.service';

@Component({
  selector: 'app-buckets',
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss'],
})
export class BucketsComponent implements OnInit {
  public displayedColumns: string[] = ['name'];
  public buckets: Bucket[] = [];

  constructor(private bucketService: BucketService, private router: Router, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.bucketService.getAll().subscribe(buckets => {
      this.buckets = buckets;
    });
  }

  public openDetails(row: Bucket): void {
    this.router.navigate([`${row.name}`], { relativeTo: this.route });
  }
}
