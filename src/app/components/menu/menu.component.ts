import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { take } from 'rxjs';
import { UserProfile } from '../../shared/user-profile';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public profile: UserProfile | null = null;

  constructor(private authenticationService: AuthenticationService) {
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public ngOnInit(): void {
    this.authenticationService.userProfile$.pipe(take(1)).subscribe(profile => this.profile = profile);
  }
}
