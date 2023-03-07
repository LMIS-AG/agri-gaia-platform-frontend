import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CreateEditDialogComponent } from './components/create-edit-dialog/create-edit-dialog.component';
import { AddMembersComponent } from './components/add-members/add-members.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FileService } from './services/file.service';

@NgModule({
  declarations: [ConfirmDialogComponent, CreateEditDialogComponent, AddMembersComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    TranslocoModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    CreateEditDialogComponent,
    AddMembersComponent,
    FileService,
  ],
})
export class SharedModule {}
