import { Location } from '@angular/common';
import { Component } from '@angular/core';
//import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  //public searchTerm = new FormControl('');

  constructor(private location: Location) {}

  /*public ngOnInit(): void {
    this.searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this))
      .subscribe(value => this.datasource.updateFilter(value));
    // TODO implement global search across all datasources...
  }*/

  public goBack(): void {
    this.location.back();
  }

  public goForward(): void {
    this.location.forward();
  }

  public save(): void {
    throw Error('Not yet implemented');
  }
}
