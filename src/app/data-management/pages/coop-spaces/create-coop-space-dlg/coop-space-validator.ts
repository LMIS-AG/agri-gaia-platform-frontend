import { FormControl, ValidationErrors } from '@angular/forms';
export class CoopSpaceValidator {
  static validCharacters(control: FormControl): ValidationErrors | null {
    const validCharactersPattern = new RegExp('^[a-z|0-9|-]{1,}$');
    return validCharactersPattern.test(control.value)
      ? null
      : {
          invalidCharacter: { valid: false },
        };
  }

  static validStartCharacter(control: FormControl): ValidationErrors | null {
    const validStartCharacterPattern = new RegExp('^[a-z|0-9]');
    return validStartCharacterPattern.test(control.value)
      ? null
      : {
          invalidStartCharacter: { valid: false },
        };
  }

  static validEndCharacter(control: FormControl): ValidationErrors | null {
    const validEndCharacterPattern = new RegExp('[a-z|0-9]$');
    return validEndCharacterPattern.test(control.value)
      ? null
      : {
          invalidEndCharacter: { valid: false },
        };
  }

  static validPrefix(control: FormControl): ValidationErrors | null {
    const invalidPrefixPattern = new RegExp('^xn--');
    return invalidPrefixPattern.test(control.value)
      ? {
          invalidPrefix: { valid: false },
        }
      : null;
  }
}
