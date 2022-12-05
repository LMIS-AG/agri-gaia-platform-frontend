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
  public membersInitial: Member[] = [];
  public myGroup = new FormGroup({
    searchTerm: new FormControl(),
  });
  public formGroups!: FormGroup[];
  public roles = $enum(CoopSpaceRole).getValues();
  @Input()
  public saveEvent!: EventEmitter<void>;

  @Output()
  private handledSelectionEvent: EventEmitter<Member[]> = new EventEmitter();

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
      .subscribe(value => {
        if (value !== '') {
          const filteredMembers = this.membersInitial.filter(
            member => member.name?.includes(value) || member.email?.includes(value) || member.company?.includes(value)
          );
          this.members = filteredMembers;
        } else {
          this.members = this.membersInitial;
        }
      });

    this.coopSpaceService.getMembers().subscribe({
      next: members => {
        this.members = members;
        this.membersInitial = members;
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

  public getInitialIndexOfMember(member: Member): number {
    return this.membersInitial.indexOf(member);
  }

  private initFormGroups(members: Member[]): FormGroup[] {
    const formGroups: FormGroup[] = [];
    members.forEach(member => {
      const formGroup = this.fb.group({
        username: [, [Validators.required]],
        role: [, [Validators.required]],
        selected: [false],
        company: [],
        name: [],
        email: [],
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
    let members: Member[] = [];
    formGroupsSelected.forEach(formGroup => {
      members.push(this.formGroupToMember(formGroup));
    });
    this.handledSelectionEvent.emit(members);
  }

  private formGroupToMember(formGroup: FormGroup): Member {
    const value = formGroup.value;
    return {
      username: value.username,
      role: value.role,
      company: value.company,
      name: value.name,
      email: value.email,
    } as Member;
  }
}
