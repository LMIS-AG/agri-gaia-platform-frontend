import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { translate } from '@ngneat/transloco';
import { KeycloakService } from 'keycloak-angular';
import { Observable, of, take } from 'rxjs';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { CoopSpace, CoopSpaceRole } from 'src/app/shared/model/coop-spaces';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { CoopSpacesService } from '../../coop-spaces.service';
import { CoopSpaceValidator } from '../coop-space-validator';
import { uniqueNameAsyncValidator } from '../unique-name-async-validator';

@Component({
  selector: 'app-create-coop-space-dlg',
  templateUrl: './create-coop-space-dlg.component.html',
  styleUrls: ['./create-coop-space-dlg.component.scss'],
})
export class CreateCoopSpaceDlgComponent implements OnInit {
  public title: string = translate('dataManagement.coopSpaces.createCoopSpaces.new'); // TODO adjust properly
  public formGroup!: FormGroup;

  // TODO can i remove these because they a part of the former generalization pattern!?
  @Input()
  public saveButtonLabel: string = '';
  @Input()
  public cancelButtonLabel: string = '';
  @Input()
  public alwaysEnableSaveButton: boolean = false;

  @Output()
  private cancelEvent: EventEmitter<void> = new EventEmitter();

  public saveEventChild: EventEmitter<void> = new EventEmitter();

  public selectableMembers: Member[] = [];
  public companies: string[] = [];

  constructor(
    protected dialogRef: MatDialogRef<any>,
    protected uiService: UIService,
    private coopSpacesService: CoopSpacesService,
    protected readonly keycloak: KeycloakService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private coopSpaceService: CoopSpacesService
  ) {
    this.formGroup = this.formBuilder.group({
      company: ['', Validators.required],
      name: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(63),
          CoopSpaceValidator.validPrefix,
          CoopSpaceValidator.validCharacters,
          CoopSpaceValidator.validStartCharacter,
          CoopSpaceValidator.validEndCharacter,
        ],
        [uniqueNameAsyncValidator(this.coopSpacesService)],
      ],
    });
  }

  public ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe(() => this.cancelEdit());
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape') {
        this.cancelEdit();
      }
    });

    this.coopSpaceService.getMembers().subscribe({
      next: members => {
        this.selectableMembers = members;
      },
      error: async response => {
        if (response.status === 401) {
          await this.keycloak.login();
        } else {
          throw response;
        }
      },
    });

    this.coopSpacesService.getValidCompanyNames().subscribe(validCompanyNames => {
      this.companies = validCompanyNames;
    });

    this.formGroup.get('company')?.valueChanges.subscribe(() => this.formGroup.get('name')?.enable());
  }

  public cancelEdit(): void {
    this.canClose().subscribe((canClose: boolean) => {
      if (canClose) {
        this.dialogRef.close();
        this.cancelEvent.emit();
      }
    });
  }

  private canClose(): Observable<boolean> {
    if (!this.formGroup.dirty) return of(true);

    return this.uiService.confirmDiscardingUnsavedChanges();
  }

  public save(): void {
    if (!this.canAndShouldSave()) {
      return;
    }
    this.saveEventChild.emit();
  }

  public canAndShouldSave(): boolean {
    if (this.alwaysEnableSaveButton) {
      return true;
    }
    return !this.formGroup.invalid && this.formGroup.dirty;
  }

  public handleSelectedMembers(membersSelected: Member[]): void {
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
