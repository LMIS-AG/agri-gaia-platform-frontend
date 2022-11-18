import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CoopSpacesService } from 'src/app/data-management/pages/coop-spaces/coop-spaces.service';
import { Member } from '../../model/member';
import { KeycloakService } from 'keycloak-angular';
import { CoopSpaceRole } from '../../model/coop-spaces';
import { $enum } from 'ts-enum-util';

@UntilDestroy()
@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss'],
})
export class AddMembersComponent implements OnInit {
  public members: Member[] = [];
  public myGroup = new FormGroup({
    searchTerm: new FormControl(),
  });
  public formGroups!: FormGroup[];
  public roles = $enum(CoopSpaceRole).getValues();
  @Input()
  public saveEvent!: EventEmitter<void>;

  @Output()
  private handledSelectionEvent: EventEmitter<FormGroup[]> = new EventEmitter();

  constructor(
    private coopSpaceService: CoopSpacesService,
    protected readonly keycloak: KeycloakService,
    private fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    if (this.saveEvent) {
      this.saveEvent.subscribe(() => {
        this.filterFormGroupsWithSelectedCheckbox();
      });
    }

    this.myGroup.controls.searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this))
      .subscribe(value => console.log(value) /*this.datasource.updateFilter(value)*/);
    // TODO implement search for members

    this.coopSpaceService.getMembers().subscribe({
      next: members => {
        this.members = members;
        this.formGroups = this.initFormGroups(members);
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

  private initFormGroups(members: Member[]): FormGroup[] {
    const formGroups: FormGroup[] = [];
    members.forEach(member => {
      const formGroup = this.fb.group({
        username: [, [Validators.required]],
        role: [, [Validators.required]],
        selected: [false],
      });
      this.applyModelToForm(member, formGroup);
      formGroups.push(formGroup);
    });

    return formGroups;
  }

  private applyModelToForm(model: Member, formGroup: FormGroup): void {
    formGroup.patchValue(model);
    formGroup.markAsPristine();
  }

  private filterFormGroupsWithSelectedCheckbox(): void {
    const formGroupsSelected: FormGroup[] = this.formGroups.filter(formGroup => formGroup.value.selected);
    // TODO maybe build members already
    this.handledSelectionEvent.emit(formGroupsSelected);
  }
}
