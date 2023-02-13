import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Member } from 'src/app/shared/model/member';

@Component({
  selector: 'app-add-members-afterwards-dlg',
  templateUrl: './add-members-afterwards-dlg.component.html',
  styleUrls: ['./add-members-afterwards-dlg.component.scss'],
})
export class AddMembersAfterwardsDlgComponent implements OnInit {
  public saveEventChild: EventEmitter<void> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  public save(): void {
    // notifies add-members (child-component) that user wants to save/confirm his selection -> after add-members-component receives saveEvent it emits the selceted memebers (see handleSelectedMembers)
    this.saveEventChild.emit();
  }

  public handleSelectedMembers(membersSelected: Member[]): void {
    // TODO do something with selected members
  }
}
