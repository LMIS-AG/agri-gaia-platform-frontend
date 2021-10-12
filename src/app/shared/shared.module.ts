import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [CommonModule, FlexLayoutModule, MatButtonModule, MatDialogModule, MatIconModule, TranslocoModule],
  exports: [CommonModule, FlexLayoutModule, MatButtonModule, MatIconModule, TranslocoModule],
})
export class SharedModule {}
