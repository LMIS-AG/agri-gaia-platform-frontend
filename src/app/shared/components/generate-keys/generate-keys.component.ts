import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generate-keys',
  templateUrl: './generate-keys.component.html',
  styleUrls: ['./generate-keys.component.scss']
})
export class GenerateKeysComponent implements OnInit {

  constructor () {}

  accessKey: string = '';
  secretKey: string = '';

  ngOnInit() {
    // Set accessKey and secretKey to the actual keys
    this.accessKey = 'ACCESS_KEY';
    this.secretKey = 'SECRET_KEY';
  }

}
