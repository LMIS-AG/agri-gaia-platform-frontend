import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public sideMenuWidth: number = 256;
  public standardBackground = true;

  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }

  public adjustMenuWidth($event: number): void {
    this.sideMenuWidth = $event;
  }

  // This is a bit hacky but the 'cleanest' solution I found.
  // TODO I need a better decision making solution in order to decide which background should be displayed.
  public onActivate(componentRef: any): void {
    // fires every time a new component is loaded

    if (!componentRef?.router?.browserUrlTree) {
      // for any reason componentRef.router.browserUrlTree is not defined for http://localhost:4200/data/policies
      this.standardBackground = true;
      return;
    }

    if (!componentRef.route) {
      // for any reason component.route is not defined for http://localhost:4200/data/coop-spaces/1/focus
      this.standardBackground = false;
      return;
    }

    const segments = componentRef.route.url._value;

    if (segments[0].path === 'coop-spaces' && segments[1] !== undefined) {
      this.standardBackground = false;
    } else {
      this.standardBackground = true;
    }
  }
}
