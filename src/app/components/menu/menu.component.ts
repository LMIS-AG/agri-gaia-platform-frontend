import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {take} from 'rxjs';
import {AuthenticationService} from '../../core/authentication/authentication.service';
import {UserProfile} from '../../shared/user-profile';
import {MenuService} from "./menu.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public profile: UserProfile | null = null;
  public userBucketName: string | undefined;

  public isMenuOpen = true;

  @Output() public toggleMenuEvent = new EventEmitter<number>();

  constructor(private authenticationService: AuthenticationService, private menuService: MenuService) {
  }

  public ngOnInit(): void {
    this.authenticationService.userProfile$.pipe(take(1)).subscribe(profile => (this.profile = profile));
    this.setUserBucketName()
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleMenuEvent.emit(this.isMenuOpen ? 295 : 75);
  }

  private setUserBucketName(): void {
    this.menuService.getAllBuckets()
      .subscribe(buckets =>
        this.userBucketName = buckets
          .map(b => b.name)
          .find(b => !b.includes("allusers")))
  }
}
