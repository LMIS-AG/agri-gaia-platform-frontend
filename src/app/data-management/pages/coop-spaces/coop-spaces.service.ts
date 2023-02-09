import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { environment } from 'src/environments/environment';
import { GeneralPurposeAsset } from '../../../shared/model/coopSpaceAsset';

@Injectable({
  providedIn: 'root',
})
export class CoopSpacesService {
  constructor(private http: HttpClient) {}

  public getAll(): Observable<CoopSpace[]> {
    return this.http.get<CoopSpace[]>(environment.backend.url + '/coopspaces')
  }

  public getCoopSpaceById(id: number): Observable<CoopSpace> {
    return this.http.get<CoopSpace>(`${environment.backend.url}/coopspaces/${id}`);
  }

  public create(coopSpace: CoopSpace): Observable<void> {
    return this.http.post<void>(environment.backend.url + '/coopspaces', coopSpace);
  }

  public getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${environment.backend.url}/coopspaces/members`);
  }

  public getValidCompanyNames(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.backend.url}/coopspaces/companies`);
  }

  public delete(coopSpace: CoopSpace): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/delete`, coopSpace);
  }

  public getAssets(id: number): Observable<GeneralPurposeAsset[]> {
    return this.http.get<GeneralPurposeAsset[]>(`${environment.backend.url}/coopspaces/${id}/assets`);
  }

  public deleteMember(memberId: Number, username: String, role: String, coopSpaceName: String, companyName: String): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/deleteMember`, {memberId, username, role, companyName, coopSpaceName});
  }

  public addMember(coopSpaceId: Number, member: Member[]): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/addMember`, {coopSpaceId, member});
  }
}
