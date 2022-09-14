import { Component, Inject } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogOptions } from '../../services/ui.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  public title: string;
  public message: string;
  public color: ThemePalette;
  public useYesNo: boolean;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ConfirmDialogModel
  ) {
    this.title = data.title;
    this.message = data.message;
    this.color = data.options.confirmButtonColor;
    this.useYesNo = data.options.buttonLabels === 'yesno';
  }

  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  public onDismiss(): void {
    this.dialogRef.close(false);
  }
}

export class ConfirmDialogModel {
  constructor(public title: string, public message: string, public options: ConfirmDialogOptions) {}
}
