import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { environment } from 'src/environments/environment';
import { CoopSpaceAsset } from '../../../shared/model/coopSpaceAsset';

// MOCK DATA ! TODO remove later when fetching data from extern
const MOCK_DATA: CoopSpace[] = [
  {
    id: 1,
    name: 'Semantische Umfeldwahrnehmung',
    mandant: 'mgrave',
    company: 'Claas',
    members: [
      { username: 'jende', role: CoopSpaceRole.Viewer } as Member,
      { username: 'alopez', role: CoopSpaceRole.Viewer } as Member,
    ],
    role: CoopSpaceRole.Editor,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CoopSpacesService {
  constructor(private http: HttpClient) {}

  public getAll(): Observable<CoopSpace[]> {
    return this.http.get<CoopSpace[]>(environment.backend.url + '/coopspaces').pipe(
      map(cs => {
        cs.forEach(c => (c.role = CoopSpaceRole.Editor));
        return cs;
      })
    );
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

  public delete(coopSpace: CoopSpace): Observable<void> {
    return this.http.post<void>(`${environment.backend.url}/coopspaces/delete`, coopSpace);
  }

  public getAssets(id: number): Observable<CoopSpaceAsset[]> {
    return this.http.get<CoopSpaceAsset[]>(`${environment.backend.url}/coopspaces/${id}/assets`);
  }
}
