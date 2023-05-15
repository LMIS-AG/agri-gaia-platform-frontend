import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Policy, PolicyType } from 'src/app/shared/model/policy';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

// MOCK DATA ! TODO remove later when fetching data from extern
const MOCK_DATA: Policy[] = [
  {
    id: 1,
    name: "Vertrags-Policy 1",
    type: PolicyType.Contract,
  },
  {
    id: 2,
    name: "Vertrags-Policy 2",
    type: PolicyType.Contract,
  },
  {
    id: 3,
    name: "Vertrags-Policy 3",
    type: PolicyType.Contract,
  },
  {
    id: 4,
    name: "Vertrags-Policy 4",
    type: PolicyType.Contract,
  },
  {
    id: 5,
    name: "Vertrags-Policy 5",
    type: PolicyType.Contract,
  },
  {
    id: 6,
    name: "Zugriffs-Policy 1",
    type: PolicyType.Access,
  },
  {
    id: 7,
    name: "Zugriffs-Policy 2",
    type: PolicyType.Access,
  },
  {
    id: 8,
    name: "Zugriffs-Policy 3",
    type: PolicyType.Access,
  },
  {
    id: 9,
    name: "Zugriffs-Policy 4",
    type: PolicyType.Access,
  },
  {
    id: 10,
    name: "Zugriffs-Policy 5",
    type: PolicyType.Access,
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
