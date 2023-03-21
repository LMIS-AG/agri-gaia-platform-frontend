import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Tag } from 'src/app/shared/model/tag';

@Component({
  selector: 'app-create-policy',
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.scss'],
})
export class CreatePolicyComponent {
  public formGroup: FormGroup;
  public policytypes: string[] = ['Vertrag', 'Zugriff'];
  public addTagForm: FormGroup;
  public tags: Tag[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', Validators.required],
      type: [''],
      duties: this.createRowFormArray(),
      permissions: this.createRowFormArray(),
      prohibitions: this.createRowFormArray(),
    });
    this.addTagForm = this.formBuilder.group({
      tagName: ['', [Validators.minLength(1)]],
    });
  }

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

  public back(): void {}

  public createPolicy(): void {
    const x = this.formGroup.value;
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

  public get duties(): FormArray {
    return this.formGroup.get('duties') as FormArray;
  }

  public get permissions(): FormArray {
    return this.formGroup.get('permissions') as FormArray;
  }

  public get prohibitions(): FormArray {
    return this.formGroup.get('prohibitions') as FormArray;
  }

  private createRowFormArray(): FormArray {
    return this.formBuilder.array([this.createRowFormGroup()]);
  }

  private createRowFormGroup(): FormGroup {
    return this.formBuilder.group({
      property: ['', [Validators.required]],
      operator: ['', Validators.required],
      attribute: ['', Validators.required],
    });
  }
}
