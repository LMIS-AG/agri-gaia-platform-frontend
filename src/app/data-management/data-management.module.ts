import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CoopSpaceDetailsComponent } from './pages/coop-spaces/coop-space-details/coop-space-details.component';
import { CoopSpacesComponent } from './pages/coop-spaces/coop-spaces.component';
import { CreateCoopSpaceDlgComponent } from './pages/coop-spaces/create-coop-space-dlg/create-coop-space-dlg.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { PoliciesComponent } from './pages/policies/policies.component';
import { CreatePolicyComponent } from './pages/policies/create-policy/create-policy.component';
import { MatSelectModule } from '@angular/material/select';
import { ConstraintsComponent } from './pages/policies/create-policy/constraints/constraints.component';
import { BucketsComponent } from './pages/buckets/buckets.component';
import { AssetsComponent } from './pages/buckets/assets/assets.component';
import { AddMembersAfterwardsDlgComponent } from './pages/coop-spaces/coop-space-details/add-members-afterwards-dlg/add-members-afterwards-dlg.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublishAssetDlgComponent } from './pages/buckets/assets/publish-asset-dlg/publish-asset-dlg.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const routes: Routes = [
  {
    path: 'asset-management/:name',
    component: AssetsComponent,
  },
  {
    path: 'asset-management',
    component: BucketsComponent,
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
    CoopSpaceDetailsComponent,
    CreateCoopSpaceDlgComponent,
    PoliciesComponent,
    CreatePolicyComponent,
    ConstraintsComponent,
    BucketsComponent,
    AssetsComponent,
    AddMembersAfterwardsDlgComponent,
    PublishAssetDlgComponent,
  ],
  imports: [
    MatTableModule,
    SharedModule,
    MatFormFieldModule,
    FormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatStepperModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
  ],
})
export class DataManagementModule {}
