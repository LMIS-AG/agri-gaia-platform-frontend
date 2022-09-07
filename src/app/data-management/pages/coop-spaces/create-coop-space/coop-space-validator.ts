import { FormControl, ValidationErrors } from '@angular/forms';
export class CoopSpaceValidator {
  static illegalPrefix(control: FormControl): ValidationErrors | null {
    const illegalPrefixPattern = new RegExp('^(?!xn--).*$');
    return illegalPrefixPattern.test(control.value)
      ? null
      : {
          illegalPrefix: { valid: false },
        };
  }
}
