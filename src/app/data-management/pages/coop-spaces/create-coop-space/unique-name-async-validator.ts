import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { CoopSpacesService } from '../coop-spaces.service';

export function uniqueNameAsyncValidator(coopSpacesService: CoopSpacesService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return coopSpacesService
      .checkIfCoopSpaceAlreadyExistsByName(control.value)
      .pipe(map(result => (result ? { coopSpaceNameAlreadyExists: true } : null)));
  };
}
