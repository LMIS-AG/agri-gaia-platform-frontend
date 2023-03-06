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

@Component({
  selector: 'app-publish-asset-dlg',
  templateUrl: './publish-asset-dlg.component.html',
  styleUrls: ['./publish-asset-dlg.component.scss'],
})
export class PublishAssetDlgComponent {
  public formGroup!: FormGroup;
  public assetTypes: AssetType[] = $enum(AssetType).getValues();

  // chips
  public separatorKeysCodes: number[] = [ENTER]; // TODO what happens if enter is removed? kann man dann nur noch aus den Vorschlägen selecten? wäre gut.
  public fruitCtrl = new FormControl(''); // TODO add this to formGroup.secondPage !?
  public filteredFruits!: Observable<string[]>;
  public selectedKeywords: string[] = [];
  public allKeywords: string[] = [
    'Aal',
    'Aaptosyax grypus',
    'Aasfresser',
    'Ab-Hof-Preis',
    'Ab-Hof-Verkauf',
    'ABA',
    'ABAG',
    'Abaka',
    'Abalistes stellaris',
    'Abalone',
    'Abamectin',
    'Abbau',
    'Abbau (Bergbau)',
    'Abbaubarkeit im Pansen',
    'Abbottina rivularis',
    'Abbrennen der Stoppeln',
    'Abdeckereiprodukt',
    'Abdeckindustrie',
    'Abdomen',
    'Abdrift',
    'Abelmoschus',
    'Abelmoschus esculentus',
    'Abelmoschus moschatus',
    'Aberia',
    'Abessinien',
    'Abessinischer Senf',
    'Abfall',
    'Abfallbehandlung',
  ]; // TODO liste; read list from file; create service
  @ViewChild('input')
  input!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: GeneralPurposeAsset,
    protected dialogRef: MatDialogRef<any>,
    protected uiService: UIService,
    private formBuilder: FormBuilder
  ) {
    const firstPage = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      version: [''],
    });

    const secondPage = this.formBuilder.group({
      assetType: [null],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      location: [''],
    });

    this.formGroup = this.formBuilder.group({ firstPage: firstPage, secondPage: secondPage });

    // chips
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allKeywords.slice()))
    );
  }

  public get firstPage(): FormGroup {
    return this.formGroup.controls.firstPage as FormGroup;
  }

  public get secondPage(): FormGroup {
    return this.formGroup.controls.secondPage as FormGroup;
  }

  /* CHIPS */
  public addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // TODO maybe check if keyword is in list? And if key was already selected?
    // TODO alternative maybe do not allow the user to enter words, only enter into input in order to saerch / filter list of keywords

    // Add our fruit
    if (value) {
      this.selectedKeywords.push(value);
    }

    // TODO remove
    console.log(this.selectedKeywords);

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  public remove(fruit: string): void {
    const index = this.selectedKeywords.indexOf(fruit);

    if (index >= 0) {
      this.selectedKeywords.splice(index, 1);
    }
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedKeywords.push(event.option.viewValue);
    this.input.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allKeywords.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
  /* CHIPS END */

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
    // TODO remove this later; only there for faster devolopment purposes!
    return true;
    return !this.firstPage.invalid && this.firstPage.dirty;
  }

  private canClose(): Observable<boolean> {
    if (!this.formGroup.dirty) return of(true);

    return this.uiService.confirmDiscardingUnsavedChanges();
  }
}