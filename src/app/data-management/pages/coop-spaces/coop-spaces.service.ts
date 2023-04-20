import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CoopSpace} from 'src/app/shared/model/coop-spaces';
import {Member} from 'src/app/shared/model/member';
import {environment} from 'src/environments/environment';
import {GeneralPurposeAsset} from '../../../shared/model/general-purpose-asset';

@Injectable({
  providedIn: 'root',
})
export class CoopSpacesService {
  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<CoopSpace[]> {
    return this.http.get<CoopSpace[]>(environment.backend.url + '/coopspaces');
  }

  public getCoopSpaceById(id: number): Observable<CoopSpace> {
    return this.http.get<CoopSpace>(`${environment.backend.url}/coopspaces/${id}`);
  }

  public create(coopSpace: CoopSpace): Observable<CoopSpace> {
    return this.http.post<CoopSpace>(environment.backend.url + '/coopspaces', coopSpace);
  }

  public getSelectableMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${environment.backend.url}/coopspaces/members`);
  }

  public getMembersOfCoopSpace(name: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${environment.backend.url}/coopspaces/${name}/members`);
  }

  public getValidCompanyNames(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.backend.url}/coopspaces/companies`);
  }

  public delete(coopSpace: CoopSpace): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/delete`, coopSpace);
  }

  public getAssets(id: number, currentRoot: string): Observable<GeneralPurposeAsset[]> {
    let base64encodedFolderName;
    if (currentRoot === '') {
      base64encodedFolderName = 'default';
    } else {
      base64encodedFolderName = btoa(currentRoot);
    }
    return this.http.get<GeneralPurposeAsset[]>(`${environment.backend.url}/coopspaces/${id}/${base64encodedFolderName}`);
  }

  public addMember(coopSpaceId: Number, coopSpaceName: string, memberList: Member[]): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/addMembers`, {coopSpaceName, memberList});
  }

  public deleteMember(coopSpaceName: String, member: Member): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/deleteMember`, {coopSpaceName, member});
  }

  public changeMemberRole(coopSpaceName: string, oldRole: String, member: Member): Observable<void> {
    let username = member.username;
    let newRole = member.role;
    let company = member.company;
    let id = member.id;
    return this.http.post<void>(
      `${environment.backend.url}/coopspaces/changeMemberRole`,
      {username, id, oldRole, newRole, coopSpaceName, company}
    );
  }

  public checkIfCoopSpaceAlreadyExistsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.backend.url}/coopspaces/existsbyname/${name}`);
  }
}
