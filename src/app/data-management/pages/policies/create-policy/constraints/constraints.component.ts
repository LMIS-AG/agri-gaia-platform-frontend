import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-constraints',
  templateUrl: './constraints.component.html',
  styleUrls: ['./constraints.component.scss'],
})
export class ConstraintsComponent implements OnInit {
  public propertyOptions: string[] = ['Foward', 'Certification'];
  public operatorOptions: string[] = ['Equal to =', 'Less than equal <='];
  public attributeOptions: string[] = ['EU Country ', 'Not Allowed', 'Attribute'];

  @Input()
  public formGroup!: FormGroup;

  @Input()
  public formArrayName!: string;

  @Output()
  private deleteEvent: EventEmitter<number> = new EventEmitter();

  @Output()
  private addEvent: EventEmitter<void> = new EventEmitter();

  constructor() {}

  public ngOnInit(): void {}

  get formArray(): FormArray {
    return this.formGroup.get(this.formArrayName) as FormArray;
  }

  public deleteConstraint(i: number): void {
    this.deleteEvent.emit(i);
  }

  public addConstraint(): void {
    this.addEvent.emit();
  }
}
