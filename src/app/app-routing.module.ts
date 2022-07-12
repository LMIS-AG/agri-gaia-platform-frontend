import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/authentication/auth-guard';

const routes: Routes = [
  {
    path: 'data',
    loadChildren: () => import('./data-management/data-management.module').then(i => i.DataManagementModule),
    canActivate: [AuthGuard]
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
