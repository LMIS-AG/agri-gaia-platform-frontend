import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {map, Observable, of, startWith} from 'rxjs';
import {AssetType} from 'src/app/shared/model/asset-type';
import {GeneralPurposeAsset} from 'src/app/shared/model/general-purpose-asset';
import {UIService} from 'src/app/shared/services/ui.service';
import {$enum} from 'ts-enum-util';
import {ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {FileService} from 'src/app/shared/services/file.service';
import {DateAdapter} from '@angular/material/core';
import {AssetJson} from 'src/app/shared/model/asset-json';
import {BucketService} from '../../bucket.service';
import {translate} from '@ngneat/transloco';
import {PolicyService} from "../../../policies/policy.service";
import {Router} from "@angular/router";

import OpenAPISchemaValidator from "openapi-schema-validator";

@Component({
    selector: 'app-publish-asset-dlg',
    templateUrl: './publish-asset-dlg.component.html',
    styleUrls: ['./publish-asset-dlg.component.scss'],
})
export class PublishAssetDlgComponent {
    public asset!: GeneralPurposeAsset;
    public assetType = AssetType;
    public formGroup!: FormGroup;
    public assetTypes: AssetType[] = $enum(AssetType).getValues();
    public policyNames!: string[];

    // chips
    public separatorKeysCodes: number[] = [ENTER]; // TODO what happens if enter is removed? kann man dann nur noch aus den Vorschlägen selecten? wäre gut.
    public keywordInputCtrl = new FormControl(''); // TODO add this to formGroup.secondPage !?
    public filteredKeywords!: Observable<string[]>;
    public selectedKeywords: string[] = [];
    public allKeywords: string[] = []; // TODO liste; read list from file; create service
    @ViewChild('input')
    input!: ElementRef<HTMLInputElement>;
    public isLoading: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) asset: GeneralPurposeAsset,
        protected dialogRef: MatDialogRef<any>,
        protected uiService: UIService,
        private formBuilder: FormBuilder,
        private fileService: FileService,
        private bucketService: BucketService,
        private policyService: PolicyService,
        private router: Router,
        private _adapter: DateAdapter<any>
    ) {
        this.initAllKeywords();
        this.initPolicyNames();
        this.initFormGroup();

        if (asset) {
            this.asset = asset;
        } else {
            throw new Error('MAT_DIALOG_DATA (asset) is not present');
        }

        this.filteredKeywords = this.keywordInputCtrl.valueChanges.pipe(
            startWith(null),
            map((keyword: string | null) => (keyword && keyword.length > 2 ? this._filter(keyword) : []))
        );

        this._adapter.setLocale('de-DE');
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

    private initFormGroup(): void {
        const firstPage = this.formBuilder.group({
            id: ['', Validators.required],
            name: ['', Validators.required],
            description: [''],
            version: [''],
            accessPolicyName: ['', Validators.required],
            contractPolicyName: ['', Validators.required],
        });

        const secondPage = this.formBuilder.group(
            {
                assetType: [AssetType.DataSet],
                startDate: [null],
                endDate: [null],
                latitude: ['', [this.validLatitudeOrEmpty]],
                longitude: ['', [this.validLongitudeOrEmpty]],
                openApiDescription: ['', [this.validOpenApiDescription]],
            },
            {validators: [this.requireLatitudeAndLongitude]}
        );

        this.formGroup = this.formBuilder.group({firstPage: firstPage, secondPage: secondPage});
    }

    private validLatitudeOrEmpty(control: FormControl): ValidationErrors | null {
        const value = control.value;
        if (!value) return null;

        const validLat = /([+\-])?[0-9]{1,2}([.,])[0-9]+/;
        return validLat.test(value)
            ? null
            : {
                invalidLatitude: {valid: false},
            };
    }

    private validLongitudeOrEmpty(control: FormControl): ValidationErrors | null {
        const value = control.value;
        if (!value) return null;

        const validLong = /([+\-])?[0-9]{1,2}([.,])[0-9]+/;
        return validLong.test(value)
            ? null
            : {
                invalidLongitude: {valid: false},
            };
    }

    private validOpenApiDescription(control: FormControl): ValidationErrors | null {
        const value: string = control.value;
        if (value === "") return null;
        const openAPIValidator = new OpenAPISchemaValidator({version: 3});
        let schema: any;
        try {
            schema = JSON.parse(value);
        } catch (e) {
            return {invalidOpenApiDescription: {valid: false}};
        }
        const {errors} = openAPIValidator.validate(schema);
        return errors.length > 0 ? {invalidOpenApiDescription: {valid: false}} : null;
    }


    private requireLatitudeAndLongitude(control: FormControl): ValidationErrors | null {
        const latitude = control.get('latitude')?.value;
        const longitude = control.get('longitude')?.value;

        if (!latitude && !longitude) {
            return null;
        }

        if ((latitude && !longitude) || (!latitude && longitude)) {
            return {requireLatitudeAndLongitude: true};
        }

        return null;
    }

    private initAllKeywords(): void {
        this.fileService.getAgrovocKeywordsFromFile().subscribe(data => {
            this.allKeywords = data.split(/\r?\n/);
        });
    }

    private initPolicyNames(): void {
        this.policyService.getAllPolicies()
            .subscribe(policies => this.policyNames = policies.map(p => p.name))
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

        this.isLoading = true;

        const firstPageCtrl = this.firstPage.controls;
        const secondPageCtrl = this.secondPage.controls;

        const accessPolicyName: string = firstPageCtrl.accessPolicyName.value;
        const contractPolicyName: string = firstPageCtrl.contractPolicyName.value;
        const assetToPublish: AssetJson = {
            // information from dialog page 1
            assetPropId: firstPageCtrl.id.value,
            assetPropName: firstPageCtrl.name.value,
            assetPropDescription: firstPageCtrl.description.value,
            assetPropVersion: firstPageCtrl.version.value,

            // information from dialog page 2
            assetPropContentType: translate(
                'dataManagement.buckets.assets.publishAssetDialog.fields.assetType.' + secondPageCtrl.assetType.value
            ),
            agrovocKeywords: this.selectedKeywords,
            dateRange: this.getDateRangeIfPresent(),
            latitude: secondPageCtrl.latitude.value ? String(secondPageCtrl.latitude.value).replace(',', '.') : undefined,
            longitude: secondPageCtrl.longitude.value ? String(secondPageCtrl.longitude.value).replace(',', '.') : undefined,
            openApiDescription: secondPageCtrl.openApiDescription.value,

            // information from asset
            dataAddressAssetName: this.asset.name,
            dataAddressBucketName: this.asset.bucket,
            assetPropByteSize: this.transformSizeStringToNumber(),
            dataAddressKeyName: 'assets/' + this.asset.name,

            // constant values
            dataAddressType: 'AmazonS3',
            dataAddressRegion: 'us-east-1',
        };

        this.bucketService.publishAsset(this.asset.bucket, this.asset.name, accessPolicyName, contractPolicyName, assetToPublish).subscribe({
            next: () => {
                this.uiService.showSuccessMessage(translate('dataManagement.buckets.assets.dialog.publishConfirmationText'));
                // Emit a boolean result indicating success
                this.dialogRef.close(true);
            },
            error: err => {
                this.uiService.showErrorMessage(
                    translate('dataManagement.buckets.assets.dialog.publishErrorText') + err.status
                );
                // Emit a boolean result indicating failure
                this.dialogRef.close(false);
            },
        });
    }

    private transformSizeStringToNumber(): number {
        // TODO adjuste regarding metrics (B, KiB, ...)
        return Number(this.asset.size.split(' ')[0]);
    }

    // TODO maybe change type of daterange or split daterange type into to localDateTimes (startDate, endDate)
    private getDateRangeIfPresent(): string | undefined {
        const secondPageCtrl = this.secondPage.controls;
        if (secondPageCtrl.assetType.value === AssetType.DataSet) {
            if (secondPageCtrl.startDate.value && secondPageCtrl.endDate.value) {
                return secondPageCtrl.startDate.value + ' - ' + secondPageCtrl.endDate.value;
            }
            return undefined;
        } else {
            return undefined;
        }
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
