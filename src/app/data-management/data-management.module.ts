import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CoopSpacesComponent } from './pages/coop-spaces/coop-spaces.component';

const routes: Routes = [
  {
    path: 'coop-spaces',
    component: CoopSpacesComponent,
  },
  {
    path: '',
    redirectTo: 'coop-spaces',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  declarations: [CoopSpacesComponent],
  imports: [MatTableModule, SharedModule, RouterModule.forChild(routes)],
})
export class DataManagementModule {}
