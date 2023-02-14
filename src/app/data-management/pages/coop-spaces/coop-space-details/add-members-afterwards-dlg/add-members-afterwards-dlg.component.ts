import { Component, EventEmitter, Input, OnInit, Output, ViewChild  } from '@angular/core';
import { Member } from 'src/app/shared/model/member';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { UIService } from 'src/app/shared/services/ui.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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

  constructor(
    private uiService: UIService,
  ) {}
  
  public ngOnInit(): void {}

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