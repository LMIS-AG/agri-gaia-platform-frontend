import { Component } from '@angular/core';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';

// TODO get data via service from backend
const DATA: CoopSpace[] = [
  {
    id: 1,
    name: 'Semantische Umfeldwahrnehmung',
    owner: 'Claas',
    member: ['AgBRAIN', 'Bosch'],
    role: CoopSpaceRole.Editor,
  },
  {
    id: 2,
    name: 'Befahrbarkeitsanalyse',
    owner: 'AgBRAIN',
    member: ['Krone', 'DFKI', 'LMIS'],
    role: CoopSpaceRole.Owner,
  },
  {
    id: 3,
    name: 'Teilfächenspezifisches Düngen',
    owner: 'Bosch',
    member: ['AgBRAIN', 'Krone'],
    role: CoopSpaceRole.Viewer,
  },
];

@Component({
  selector: 'app-coop-spaces',
  templateUrl: './coop-spaces.component.html',
  styleUrls: ['./coop-spaces.component.scss'],
})
export class CoopSpacesComponent {
  public displayedColumns: string[] = ['name', 'owner', 'member', 'role'];
  public dataSource = DATA;

  constructor() {}

  public addCoopSpace(): void {}
}
