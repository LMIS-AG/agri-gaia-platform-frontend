import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Policy} from 'src/app/shared/model/policy';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class PolicyService {

  constructor(private http: HttpClient) {}

  public getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${environment.backend.url}/edc/policies`)
  }

  public deletePolicy(policyName: string): Observable<HttpResponse<unknown>> {
    return this.http.delete(`${environment.backend.url}/edc/policies/${policyName}`,
      {observe: 'response'});
  }
}
