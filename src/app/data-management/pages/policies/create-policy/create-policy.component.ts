import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PolicyService} from "../policy.service";
import {Constraint, ConstraintType} from 'src/app/shared/model/constraint';
import {Policy, PolicyType} from "../../../../shared/model/policy";
import {HttpResponse} from "@angular/common/http";
import {translate} from "@ngneat/transloco";
import {UIService} from "../../../../shared/services/ui.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-policy',
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.scss'],
})
export class CreatePolicyComponent {
  public formGroup: FormGroup;
  public policytypes: PolicyType[] = Object.values(PolicyType);

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private policyService: PolicyService,
    private uiService: UIService,
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      permissions: this.createRowFormArray(),
    });
  }

  public back(): void {
  }

  public addPolicy(): void {
    const formValues = this.formGroup.value;
    let name = formValues.name;
    let policyType = formValues.type;
    const permissions: Constraint[] = formValues.permissions.map((permission: any) =>
      ({
        constraintType: ConstraintType.Permission,
        leftExpression: permission.property,
        operator: permission.operator,
        rightExpression: permission.attribute,
      }));
    const policy: Policy = ({
      name: name,
      policyType: policyType,
      permissions: permissions,
    });
    this.policyService.addPolicy(policy).subscribe({
      next: (response: HttpResponse<unknown>) => {
        this.handleAddSuccess()
      }, error: err => {
        this.handleAddError(err)
      }
    });
  }

  private handleAddSuccess(): void {
    this.router.navigate(['data/policies']);
    this.uiService.showSuccessMessage(translate('dataManagement.policies.createPolicy.createConfirmationText'))
  }

  private handleAddError(err: any): void {
    this.uiService.showErrorMessage(translate('dataManagement.policies.createPolicy.createErrorText') + err.status);
  }

  public addPermission(): void {
    this.permissions.push(this.createRowFormGroup());
  }

  public deletePermission(index: number): void {
    this.permissions.removeAt(index);
  }

  public get permissions(): FormArray {
    return this.formGroup.get('permissions') as FormArray;
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
