import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-constraints',
  templateUrl: './constraints.component.html',
  styleUrls: ['./constraints.component.scss'],
})
export class ConstraintsComponent {
  public leftExpressions: string[] = ['POLICY_EVALUATION_TIME'];
  public operators: string[] = ['EQ', 'NEQ', 'LT', 'GT', 'LEQ', 'GEQ'];

  @Input()
  public formGroup!: FormGroup;

  @Input()
  public formArrayName!: string;

  @Output()
  private deleteEvent: EventEmitter<number> = new EventEmitter();

  @Output()
  private addEvent: EventEmitter<void> = new EventEmitter();

  constructor() {}

  public get formArray(): FormArray {
    return this.formGroup.get(this.formArrayName) as FormArray;
  }

  public deleteConstraint(i: number): void {
    this.deleteEvent.emit(i);
  }

  public addConstraint(): void {
    this.addEvent.emit();
  }
}
