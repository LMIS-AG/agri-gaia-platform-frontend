import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { take } from 'rxjs';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserProfile } from '../../shared/user-profile';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public profile: UserProfile | null = null;

  public isMenuOpen = true;

  @Output() public toggleMenuEvent = new EventEmitter<number>();

  constructor(private authenticationService: AuthenticationService) {}

  public ngOnInit(): void {
    this.authenticationService.userProfile$.pipe(take(1)).subscribe(profile => (this.profile = profile));
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleMenuEvent.emit(this.isMenuOpen ? 295 : 75);
  }
}
