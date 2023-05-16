import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CoopSpace} from 'src/app/shared/model/coop-spaces';
import {Policy} from 'src/app/shared/model/policy';
import {PolicyService} from './policy.service';

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
})
export class PoliciesComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'type', 'more'];
  public dataSource: Policy[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private policyService: PolicyService) {}

  public ngOnInit(): void {
    this.initPolicyList();
  }

  private initPolicyList(): void {
    this.policyService.getAllPolicies().subscribe(policies => {
      this.dataSource = policies;
    });
  }

  public addPolicy(): void {
    this.router.navigate(['create'], {relativeTo: this.route});
  }

  public onDelete(policyName: string): void {
    this.policyService.deletePolicy(policyName).subscribe(() => this.initPolicyList())
  }

  // TODO potentially useful in next Story
  public openDetails(row: CoopSpace): void {
  }
}
