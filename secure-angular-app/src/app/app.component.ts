import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserEmail(): string {
    return this.authService.getCurrentUserValue()?.email || '';
  }

  get currentUserRole(): string {
    return this.authService.getCurrentUserValue()?.role || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
