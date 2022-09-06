import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { translate } from '@ngneat/transloco';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { UIService } from 'src/app/shared/services/ui.service';
import { CoopSpacesComponent } from '../coop-spaces.component';
import { CoopSpacesService } from '../coop-spaces.service';

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
    private uiService: UIService
  ) {
    this.formGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3), // not necessary cause this is specified through the pattern - but maybe this helps to show the user what he did wrong
          Validators.maxLength(63),
          Validators.pattern('^[a-z|0-9]([a-z|0-9|.|-]{1,61})[a-z|0-9]$'),
          // TODO filter out IP-Address formats
        ],
      ],
      company: ['', Validators.required],
    });
  }

  public onSave(): void {
    const newCoopSpace: CoopSpace = {
      company: this.formGroup.get('company')?.value,
      name: this.formGroup.get('name')?.value,
      member: [],
      role: CoopSpaceRole.Owner,
    };

    this.coopSpacesService.create(newCoopSpace).subscribe(createdCoopSpace => {
      this.uiService.showSuccessMessage(translate('common.successfullySaved'));
      this.dialogRef.close(createdCoopSpace);
    });
  }
}
