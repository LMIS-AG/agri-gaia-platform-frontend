import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
})
export class AddMembersComponent implements OnInit {
  public myGroup = new FormGroup({
    searchTerm: new FormControl(),
  });

  constructor() {}

  public ngOnInit(): void {
    this.myGroup.controls.searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this))
      .subscribe(value => console.log(value) /*this.datasource.updateFilter(value)*/);
    // TODO implement search for members
  }
}