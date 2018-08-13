import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userAuthenticated = false;
  private authListenerSubs: Subscription;
  displayName: string;
  private dNameListenerSubs: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.displayName = this.authService.getDisplayName();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userAuthenticated = isAuthenticated;
    });
    this.dNameListenerSubs = this.authService.getDNameListener().subscribe(displayName => {
      this.displayName = displayName;
    });
  }

  onLogOut() {
    this.authService.logOut();
  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.dNameListenerSubs.unsubscribe();
  }
}
