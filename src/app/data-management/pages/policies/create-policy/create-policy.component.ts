import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-create-policy',
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.scss'],
})
export class CreatePolicyComponent implements OnInit {
  public formGroup: FormGroup; // TODO rename
  public options: string[] = ['Vertrag', 'Zugriff']; // TODO rename
  public addTagForm: FormGroup;
  public tags: Tag[] = [];
  // lower part
  public propertyOptions: string[] = ['Foward', 'Certification'];
  public operatorOptions: string[] = ['Equal to =', 'Less than equal <='];
  public attributeOptions: string[] = ['EU Country ', 'Not Allowed', 'Attribute'];
  // FormGroup muss Wurzel sein und FormArray enthalten, FormArray könnte wiederum FormGroup mit 3 FormControls enthalten

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', Validators.required],
      duties: this.createRowFormArray(),
      permissions: this.createRowFormArray(),
      prohibitions: this.createRowFormArray(),
    });
    this.addTagForm = this.formBuilder.group({
      tagName: ['', [Validators.minLength(1)]],
    });
  }

  get duties(): FormArray {
    return this.formGroup.get('duties') as FormArray;
  }

  get permissions(): FormArray {
    return this.formGroup.get('permissions') as FormArray;
  }

  get prohibitions(): FormArray {
    return this.formGroup.get('prohibitions') as FormArray;
  }

  public ngOnInit(): void {}

  public onSave(): void {}

  public removeTag(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }

  public addTagging(): void {
    const formValue = this.addTagForm.value;
    this.tags.push({ name: formValue.tagName } as Tag);
    this.addTagForm.reset();
  }

  private createRowFormArray(): FormArray {
    //return this.formBuilder.array([this.createRowFormGroup()]);
    return this.formBuilder.array([
      this.formBuilder.group({
        property: ['', [Validators.required]],
        operator: ['', Validators.required],
        attribute: ['', Validators.required],
      }),
    ]);
  }

  private createRowFormGroup(): FormGroup {
    return this.formBuilder.group({
      property: ['', [Validators.required]],
      operator: ['', Validators.required],
      attribute: ['', Validators.required],
    });
  }

  public addDuty(): void {
    this.duties.push(this.createRowFormGroup());
  }

  public deleteDuty(index: number): void {
    this.duties.removeAt(index);
  }

  public addPermission(): void {
    this.permissions.push(this.createRowFormGroup());
  }

  public deletePermission(index: number): void {
    this.permissions.removeAt(index);
  }

  public addProhibition(): void {
    this.prohibitions.push(this.createRowFormGroup());
  }

  public deleteProhibition(index: number): void {
    this.prohibitions.removeAt(index);
  }

  public back(): void {}

  public createPolicy(): void {
    const x = this.formGroup.value;
    console.log(x); //TODO remove
  }
}

// TODO place into model folder or something..
export interface Tag {
  name: string;
}
