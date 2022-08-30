import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';

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
    //https://platform-backend.platform.agri-gaia.com/coopspaces
    // 172.30.27.77
    this.http.post('platform-backend-git2.agrigaia-ui.svc.cluster.local/coopspaces', {}).subscribe(x => console.log(x));
    return of(coopSpace);
  }
}
