import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';

// MOCK DATA ! TODO remove later when fetching data from extern
const MOCK_DATA: CoopSpace[] = [
  {
    id: 1,
    name: 'Semantische Umfeldwahrnehmung',
    company: 'Claas',
    member: ['AgBRAIN', 'Bosch'],
    role: CoopSpaceRole.Editor,
  },
  {
    id: 2,
    name: 'Befahrbarkeitsanalyse',
    company: 'AgBRAIN',
    member: ['Krone', 'DFKI', 'LMIS'],
    role: CoopSpaceRole.Owner,
  },
  {
    id: 3,
    name: 'Teilfächenspezifisches Düngen',
    company: 'Bosch',
    member: ['AgBRAIN', 'Krone'],
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
    return of(this.mockData);
  }

  public getCoopSpaceById(id: number): Observable<CoopSpace | null> {
    const res = this.mockData.find(coopSpace => coopSpace.id === id);
    return of(res ? res : null);
  }

  public create(coopSpace: CoopSpace): Observable<CoopSpace> {
    this.http
      //.post('https://ag-platform-ui-frontend.platform.agri-gaia.com/api/coopspaces', {
      .post('http://localhost:8080/coopspaces', {
        name: coopSpace.name,
        company: coopSpace.company,
      })
      .subscribe(x => console.log(x));
    return of(coopSpace);
  }

  public getMembers(): Observable<Member[]> {
    this.http.get<Member[]>('http://localhost:8080/coopspaces/members').subscribe(x => console.log(x));

    const member: Member = { id: 1, name: 'Mock', company: 'MockComp', role: CoopSpaceRole.Viewer };
    return of([member]);
  }
}
