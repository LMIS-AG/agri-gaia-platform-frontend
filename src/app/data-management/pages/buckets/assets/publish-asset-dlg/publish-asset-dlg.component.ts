import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, Observable, of, startWith } from 'rxjs';
import { AssetType } from 'src/app/shared/model/asset-type';
import { GeneralPurposeAsset } from 'src/app/shared/model/coopSpaceAsset';
import { UIService } from 'src/app/shared/services/ui.service';
import { $enum } from 'ts-enum-util';
import { ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FileService } from 'src/app/shared/services/file.service';

@Component({
  selector: 'app-publish-asset-dlg',
  templateUrl: './publish-asset-dlg.component.html',
  styleUrls: ['./publish-asset-dlg.component.scss'],
})
export class PublishAssetDlgComponent implements OnInit {
  public assetType = AssetType;
  public formGroup!: FormGroup;
  public assetTypes: AssetType[] = $enum(AssetType).getValues();

  // chips
  public separatorKeysCodes: number[] = [ENTER]; // TODO what happens if enter is removed? kann man dann nur noch aus den Vorschlägen selecten? wäre gut.
  public keywordInputCtrl = new FormControl(''); // TODO add this to formGroup.secondPage !?
  public filteredKeywords!: Observable<string[]>;
  public selectedKeywords: string[] = [];
  public allKeywords: string[] = []; // TODO liste; read list from file; create service
  @ViewChild('input')
  input!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: GeneralPurposeAsset,
    protected dialogRef: MatDialogRef<any>,
    protected uiService: UIService,
    private formBuilder: FormBuilder,
    private fileService: FileService
  ) {
    this.initAllKeywords();
    this.initFormGroup();

    this.filteredKeywords = this.keywordInputCtrl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) => (keyword && keyword.length > 2 ? this._filter(keyword) : []))
    );
  }

  public get firstPage(): FormGroup {
    return this.formGroup.controls.firstPage as FormGroup;
  }

  public get secondPage(): FormGroup {
    return this.formGroup.controls.secondPage as FormGroup;
  }

  public get currentAssetType(): AssetType {
    return this.secondPage.controls.assetType.value;
  }

  public ngOnInit(): void {
    this.secondPage.controls.assetType.valueChanges.subscribe(value => {
      if (value === AssetType.AiModel) {
        this.secondPage.controls.startDate.clearValidators();
        this.secondPage.controls.endDate.clearValidators();
      } else {
        this.secondPage.controls.startDate.setValidators(Validators.required);
        this.secondPage.controls.endDate.setValidators(Validators.required);
      }

      this.secondPage.controls.startDate.updateValueAndValidity();
      this.secondPage.controls.endDate.updateValueAndValidity();
    });
  }

  private initFormGroup(): void {
    const firstPage = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      version: [''],
    });

    const secondPage = this.formBuilder.group({
      assetType: [AssetType.DataSet],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      location: [''],
    });

    this.formGroup = this.formBuilder.group({ firstPage: firstPage, secondPage: secondPage });
  }

  private initAllKeywords(): void {
    this.fileService.getAgrovocKeywordsFromFile().subscribe(data => {
      const words = data.split(/\r?\n/);
      this.allKeywords = words;
    });
  }

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
  public canGoToSecondPage(): boolean {
    return !this.firstPage.invalid && this.firstPage.dirty;
  }

  private canClose(): Observable<boolean> {
    if (!this.formGroup.dirty) return of(true);

    return this.uiService.confirmDiscardingUnsavedChanges();
  }

  /* CHIPS */
  public addKeyword(event: MatChipInputEvent): void {
    const value: string = (event.value || '').trim();

    if (value && this.allKeywords.find(keyword => keyword === value)) {
      this.selectedKeywords.push(value);
    } else {
      return;
    }

    event.chipInput!.clear();
    this.keywordInputCtrl.setValue(null);
  }

  public remove(keyword: string): void {
    const index = this.selectedKeywords.indexOf(keyword);

    if (index >= 0) {
      this.selectedKeywords.splice(index, 1);
    }
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    const selectedKeyword = event.option.viewValue;
    if (selectedKeyword && !this.selectedKeywords.find(keyword => keyword === selectedKeyword)) {
      this.selectedKeywords.push(selectedKeyword);
    }
    this.input.nativeElement.value = '';
    this.keywordInputCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allKeywords.filter(keyword => keyword.toLowerCase().includes(filterValue));
  }
  /* CHIPS END */
}
