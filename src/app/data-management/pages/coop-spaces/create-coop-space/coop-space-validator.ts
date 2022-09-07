import { FormControl, ValidationErrors } from '@angular/forms';
export class CoopSpaceValidator {
  static validCharacters(control: FormControl): ValidationErrors | null {
    const validCharactersPattern = new RegExp('^[a-z|0-9|.|-]{1,}$');
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
          validStartCharacter: { valid: false },
        };
  }

  static validEndCharacter(control: FormControl): ValidationErrors | null {
    const validEndCharacterPattern = new RegExp('[a-z|0-9]$');
    return validEndCharacterPattern.test(control.value)
      ? null
      : {
          validEndCharacter: { valid: false },
        };
  }

  static noIPAddressPattern(control: FormControl): ValidationErrors | null {
    const ipAddressPattern = new RegExp('^[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}$');
    return ipAddressPattern.test(control.value)
      ? {
          ipAddressPattern: { valid: false },
        }
      : null;
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
