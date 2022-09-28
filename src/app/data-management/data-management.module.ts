import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CoopSpaceDetailsFocusComponent } from './pages/coop-spaces/coop-space-details-focus/coop-space-details-focus.component';
import { CoopSpaceDetailsComponent } from './pages/coop-spaces/coop-space-details/coop-space-details.component';
import { CoopSpacesComponent } from './pages/coop-spaces/coop-spaces.component';
import { CreateCoopSpaceComponent } from './pages/coop-spaces/create-coop-space/create-coop-space.component';
import { CreateCoopSpaceDlgComponent } from './pages/coop-spaces/create-coop-space/create-coop-space-dlg/create-coop-space-dlg.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { PoliciesComponent } from './pages/policies/policies.component';
import { CreatePolicyComponent } from './pages/policies/create-policy/create-policy.component';
import { MatSelectModule } from '@angular/material/select';
import { ConstraintsComponent } from './pages/policies/createPolicy/constraints/constraints.component';

const routes: Routes = [
  {
    path: 'coop-spaces/:id/focus',
    component: CoopSpaceDetailsFocusComponent,
  },
  {
    path: 'coop-spaces/:id',
    component: CoopSpaceDetailsComponent,
  },
  {
    path: 'coop-spaces',
    component: CoopSpacesComponent,
  },
  {
    path: 'policies',
    component: PoliciesComponent,
  },
  {
    path: 'policies/create',
    component: CreatePolicyComponent,
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
  declarations: [
    CoopSpacesComponent,
    CreateCoopSpaceComponent,
    CoopSpaceDetailsComponent,
    CoopSpaceDetailsFocusComponent,
    CreateCoopSpaceDlgComponent,
    PoliciesComponent,
    CreatePolicyComponent,
    ConstraintsComponent,
  ],
  imports: [
    MatTableModule,
    SharedModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class DataManagementModule {}
