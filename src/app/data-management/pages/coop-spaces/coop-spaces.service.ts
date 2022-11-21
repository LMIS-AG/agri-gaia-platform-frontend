import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { environment } from 'src/environments/environment';

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
  {
    id: 2,
    name: 'Befahrbarkeitsanalyse',
    mandant: 'mgrave',
    company: 'AgBRAIN',
    members: [
      { username: 'jende', role: CoopSpaceRole.Viewer } as Member,
      { username: 'alopez', role: CoopSpaceRole.Viewer } as Member,
    ],
    role: CoopSpaceRole.Owner,
  },
  {
    id: 3,
    name: 'Teilfächenspezifisches Düngen',
    company: 'Bosch',
    mandant: 'mgrave',
    members: [
      { username: 'jende', role: CoopSpaceRole.Viewer } as Member,
      { username: 'alopez', role: CoopSpaceRole.Viewer } as Member,
    ],
    role: CoopSpaceRole.Viewer,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CoopSpacesService {
  private mockData: CoopSpace[] = MOCK_DATA;

  constructor(private http: HttpClient) {}

  public getAll(): Observable<CoopSpace[]> {
    //this.http.get(environment.backend.url + '/coopspaces').subscribe(x => console.log(x)); // TODO remove log
    return of(this.mockData);
  }

  public getCoopSpaceById(id: number): Observable<CoopSpace | null> {
    const res = this.mockData.find(coopSpace => coopSpace.id === id);
    return of(res ? res : null);
  }

  public create(coopSpace: CoopSpace): Observable<CoopSpace> {
    this.http
      .post(environment.backend.url + '/coopspaces', {
        name: coopSpace.name,
        company: coopSpace.company,
        mandant: coopSpace.mandant,
        members: coopSpace.members,
      })
      .subscribe(x => console.log(x)); // TODO remove log
    return of(coopSpace);
  }

  public getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(environment.backend.url + '/coopspaces/members');
  }

  public delete(coopSpace: CoopSpace): void {
    // START of mock code section; TODO remove this later
    coopSpace = {
      name: 'abc-test04',
      company: 'LMIS',
      mandant: 'mgrave',
      members: [] as Member[],
    } as CoopSpace;
    // END of mock code section

    this.http
      .put(environment.backend.url + '/coopspaces', {
        name: coopSpace.name,
        company: coopSpace.company,
        mandant: coopSpace.mandant,
        members: coopSpace.members,
      })
      .subscribe(x => console.log(x)); // TODO remove log
  }
}
