import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Policy, PolicyType } from 'src/app/shared/model/policy';

// MOCK DATA ! TODO remove later when fetching data from extern
const MOCK_DATA: Policy[] = [
  {
    id: 1,
    name: 'Data Policy for Confidential Data',
    type: PolicyType.Contract,
    inUse: false,
  },
  {
    id: 2,
    name: 'Data Policy for Non-Confidential Data',
    type: PolicyType.Access,
    inUse: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  private mockData: Policy[] = MOCK_DATA;

  constructor() {}

  public getAll(): Observable<Policy[]> {
    return of(this.mockData);
  }
}
