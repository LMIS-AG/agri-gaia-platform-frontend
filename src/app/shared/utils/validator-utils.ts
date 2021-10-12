import { ValidatorFn } from '@angular/forms';

export const conditionalValidator = (predicate: () => boolean, validator: ValidatorFn): ValidatorFn => {
  return formControl => {
    if (!formControl.parent) {
      // Wait until form is available.
      return null;
    }
    return predicate() ? validator(formControl) : null;
  };
};
