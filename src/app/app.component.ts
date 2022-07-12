import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public sideMenuWidth: number = 256;

  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }

  public adjustMenuWidth($event: number): void {
    this.sideMenuWidth = $event;
  }
}
