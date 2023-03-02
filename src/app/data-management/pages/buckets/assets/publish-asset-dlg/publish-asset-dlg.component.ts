import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';

@Component({
  selector: 'app-publish-asset-dlg',
  templateUrl: './publish-asset-dlg.component.html',
  styleUrls: ['./publish-asset-dlg.component.scss'],
})
export class PublishAssetDlgComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) data: GeneralPurposeAsset) {}

  ngOnInit(): void {}
}
