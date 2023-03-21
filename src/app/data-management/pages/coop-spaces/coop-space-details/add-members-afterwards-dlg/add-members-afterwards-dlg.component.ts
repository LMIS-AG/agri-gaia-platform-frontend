import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { Member } from 'src/app/shared/model/member';
import { Observable } from 'rxjs';
import { UIService } from 'src/app/shared/services/ui.service';
import { CoopSpacesService } from '../../coop-spaces.service';
import { KeycloakService } from 'keycloak-angular';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoopSpace } from 'src/app/shared/model/coop-spaces';

@Component({
  selector: 'app-add-members-afterwards-dlg',
  templateUrl: './add-members-afterwards-dlg.component.html',
  styleUrls: ['./add-members-afterwards-dlg.component.scss'],
})
export class AddMembersAfterwardsDlgComponent implements OnInit {
  public saveEventChild: EventEmitter<void> = new EventEmitter();

  @Input()
  public saveButtonLabel: string = '';
  @Input()
  public cancelButtonLabel: string = '';

  @Output()
  public cancelEvent: EventEmitter<void> = new EventEmitter();
  @Output()
  public membersSelected = new EventEmitter<Member[]>();

  public selectableMembers: Member[] = [];

  constructor(
    private uiService: UIService,
    protected readonly keycloak: KeycloakService,
    private coopSpaceService: CoopSpacesService,
    @Inject(MAT_DIALOG_DATA) public data: CoopSpace
  ) {}

  public ngOnInit(): void {
    this.coopSpaceService.getSelectableMembers().subscribe({
      next: members => {
        this.selectableMembers = members.filter(member => {
          return !this.data.members.some(coopSpaceMember => coopSpaceMember.username === member.username);
        });
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
        this.cancelEvent.emit();
      }
    });
  }

  private canClose(): Observable<boolean> {
    return this.uiService.confirmDiscardingUnsavedChanges();
  }

  public save(): void {
    // notifies add-members (child-component) that user wants to save/confirm his selection -> after add-members-component receives saveEvent it emits the selceted memebers (see handleSelectedMembers)
    this.saveEventChild.emit();
  }

  public handleSelectedMembers(membersSelected: Member[]): void {
    this.membersSelected.emit(membersSelected);
  }
}
