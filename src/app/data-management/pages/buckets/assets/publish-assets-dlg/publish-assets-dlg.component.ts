import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-publish-assets-dlg',
  templateUrl: './publish-assets-dlg.component.html',
  styleUrls: ['./publish-assets-dlg.component.scss'],
})
export class PublishAssetsDlgComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<PublishAssetsDlgComponent>) {}

  public ngOnInit(): void {}

  public canPublish(): boolean {
    return true;
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {}
}
