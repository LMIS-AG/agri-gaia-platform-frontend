import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'data',
    loadChildren: () => import('./data-management/data-management.module').then(i => i.DataManagementModule),
  },
  {
    path: '**',
    redirectTo: 'data',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
