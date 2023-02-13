import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Member } from 'src/app/shared/model/member';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { UIService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-add-members-afterwards-dlg',
  templateUrl: './add-members-afterwards-dlg.component.html',
  styleUrls: ['./add-members-afterwards-dlg.component.scss'],
})
export class AddMembersAfterwardsDlgComponent implements OnInit {
  public saveEventChild: EventEmitter<void> = new EventEmitter();

  @Input()
  public formGroup!: FormGroup;
  @Input()
  public saveButtonLabel: string = '';
  @Input()
  public cancelButtonLabel: string = '';

  @Output()
  private cancelEvent: EventEmitter<void> = new EventEmitter();
  @Output()
  private saveEventParent: EventEmitter<Member[]> = new EventEmitter();

  public membersSelected: Member[] = [];

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
    if (!this.formGroup.dirty) return of(true);

    return this.uiService.confirmDiscardingUnsavedChanges();
  }

  public save(): void {
    // notifies add-members (child-component) that user wants to save/confirm his selection -> after add-members-component receives saveEvent it emits the selceted memebers (see handleSelectedMembers)
    this.saveEventChild.emit();
  }

  public handleSelectedMembers(membersSelected: Member[]): void {
    this.saveEventParent.emit(membersSelected);
  }
}
