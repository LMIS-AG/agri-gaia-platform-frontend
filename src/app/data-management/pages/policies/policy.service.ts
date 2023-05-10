import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Policy, PolicyType } from 'src/app/shared/model/policy';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

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

  constructor(private http: HttpClient) {}

  public getAllPolicies(): Observable<Policy[]> {
   return of(this.mockData)
  }
  public getAllPolicyNames(bucketName: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.backend.url}/assets/policies/${bucketName}`)
  }
}
