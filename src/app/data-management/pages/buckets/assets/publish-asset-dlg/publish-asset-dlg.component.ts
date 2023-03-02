import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { AssetType } from 'src/app/shared/model/asset-type';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';
import { UIService } from 'src/app/shared/services/ui.service';
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
    protected uiService: UIService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      assetType: [null],
    });
  }

  public ngOnInit(): void {}

  public cancel(): void {
    this.canClose().subscribe((canClose: boolean) => {
      if (canClose) {
        this.dialogRef.close();
      }
    });
  }

  public publishAsset(): void {
    if (!this.canAndShouldSave()) {
      return;
    }

    // TODO implement

    this.dialogRef.close();
  }

  public canAndShouldSave(): boolean {
    return !this.formGroup.invalid && this.formGroup.dirty;
  }

  private canClose(): Observable<boolean> {
    if (!this.formGroup.dirty) return of(true);

    return this.uiService.confirmDiscardingUnsavedChanges();
  }
}
