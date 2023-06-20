export interface Constraint {
  constraintType: ConstraintType;
  leftExpression: string;
  operator: string;
  rightExpression: string;
}

export enum ConstraintType {
  Permission = "PERMISSION",
  Obligation = "OBLIGATION",
  Duty = "DUTY",
}
