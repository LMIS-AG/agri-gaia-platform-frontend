import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Policy, PolicyType } from 'src/app/shared/model/policy';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class PolicyService {

  constructor(private http: HttpClient) {}

  public getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${environment.backend.url}/edc/policies`)
  }
}
