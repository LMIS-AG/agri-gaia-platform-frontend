import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { translate } from '@ngneat/transloco';
import { take } from 'rxjs';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { CoopSpacesComponent } from '../coop-spaces.component';
import { CoopSpacesService } from '../coop-spaces.service';
import { CoopSpaceValidator } from './coop-space-validator';

@Component({
  selector: 'app-create-coop-space',
  templateUrl: './create-coop-space.component.html',
  styleUrls: ['./create-coop-space.component.scss'],
})
export class CreateCoopSpaceComponent {
  public formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CoopSpacesComponent>,
    private formBuilder: FormBuilder,
    private coopSpacesService: CoopSpacesService,
    private uiService: UIService,
    private authenticationService: AuthenticationService
  ) {
    this.formGroup = this.formBuilder.group({
      company: ['', Validators.required],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(63),
          CoopSpaceValidator.validPrefix,
          CoopSpaceValidator.validCharacters,
          CoopSpaceValidator.validStartCharacter,
          CoopSpaceValidator.validEndCharacter,
          CoopSpaceValidator.noIPAddressPattern,
        ],
      ],
    });
  }

  public onSave(membersSelected: Member[]): void {
    this.authenticationService.userProfile$.pipe(take(1)).subscribe(profile => {
      const newCoopSpace: CoopSpace = {
        company: this.formGroup.get('company')?.value,
        name: this.formGroup.get('name')?.value,
        mandant: profile!.username,
        members: membersSelected,
        role: CoopSpaceRole.Admin,
      };

      this.coopSpacesService.create(newCoopSpace).subscribe(() => {
        this.uiService.showSuccessMessage(
          translate('dataManagement.coopSpaces.createCoopSpaces.successfullyRequested')
        );
        this.dialogRef.close(true);
      });
    });
  }
}
