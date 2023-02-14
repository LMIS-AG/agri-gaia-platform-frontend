import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { Observable, of } from 'rxjs';
import { Member } from 'src/app/shared/model/member';
import { UIService } from 'src/app/shared/services/ui.service';
import { CoopSpacesService } from '../../coop-spaces.service';

@Component({
  selector: 'app-create-coop-space-dlg',
  templateUrl: './create-coop-space-dlg.component.html',
  styleUrls: ['./create-coop-space-dlg.component.scss'],
})
export class CreateCoopSpaceDlgComponent implements OnInit {
  @Input()
  public formGroup!: FormGroup;
  @Input()
  public title: string = '';
  @Input()
  public saveButtonLabel: string = '';
  @Input()
  public cancelButtonLabel: string = '';
  @Input()
  public alwaysEnableSaveButton: boolean = false;

  @Output()
  private saveEventParent: EventEmitter<Member[]> = new EventEmitter();

  @Output()
  private cancelEvent: EventEmitter<void> = new EventEmitter();

  public saveEventChild: EventEmitter<void> = new EventEmitter();

  public selectableMembers: Member[] = [];

  constructor(
    protected dialogRef: MatDialogRef<any>,
    protected uiService: UIService,
    protected readonly keycloak: KeycloakService,
    private coopSpaceService: CoopSpacesService
  ) {}

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
    this.saveEventParent.emit(membersSelected);
  }
}
