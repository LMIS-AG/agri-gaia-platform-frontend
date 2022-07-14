import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CoopSpacesComponent } from './pages/coop-spaces/coop-spaces.component';
import { OverviewComponent } from './pages/overview/overview.component';

const routes: Routes = [
  {
    path: 'coop-spaces',
    component: CoopSpacesComponent,
  },
  {
    path: '',
    component: OverviewComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  declarations: [OverviewComponent, CoopSpacesComponent],
  imports: [MatTableModule, SharedModule, RouterModule.forChild(routes)],
})
export class DataManagementModule {}
