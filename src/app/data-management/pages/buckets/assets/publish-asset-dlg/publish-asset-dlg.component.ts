import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetType } from 'src/app/shared/model/asset-type';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';
import { $enum } from 'ts-enum-util';

@Component({
  selector: 'app-publish-asset-dlg',
  templateUrl: './publish-asset-dlg.component.html',
  styleUrls: ['./publish-asset-dlg.component.scss'],
})
export class PublishAssetDlgComponent implements OnInit {
  public formGroup!: FormGroup;
  public assetTypes: AssetType[] = $enum(AssetType).getValues();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: GeneralPurposeAsset,
    protected dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(63)]],
      description: ['', [Validators.maxLength(300)]],
      assetType: [null],
    });
  }

  public ngOnInit(): void {}

  public cancel(): void {
    // TODO maybe add canClose later

    this.dialogRef.close();
  }

  public publishAsset(): void {
    // TODO implement

    this.dialogRef.close();
  }
}
