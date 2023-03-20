import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { CoopSpacesService } from '../coop-spaces.service';

export function uniqueNameAsyncValidator(coopSpacesService: CoopSpacesService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = control.value;
    const company = control.parent?.get('company')?.value?.toLowerCase();
    const nameInMinio = `prj-${company}-${name}`;

    return coopSpacesService
      .checkIfCoopSpaceAlreadyExistsByName(nameInMinio)
      .pipe(map(result => (result ? { coopSpaceNameAlreadyExists: true } : null)));
  };
}
