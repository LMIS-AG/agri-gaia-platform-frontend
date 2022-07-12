import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  constructor(private http: HttpClient) {
  }

  public callAndLog(): void {
    this.http.get('http://localhost:8080/examples').subscribe(r => console.log(r));
  }
}
