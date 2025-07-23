import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-wrapper">
      <nav class="navbar" *ngIf="authService.isAuthenticated()">
        <div class="nav-content">
          <div class="nav-brand">
            <i class="fas fa-shield-alt"></i>
            <span>Secure App</span>
          </div>
          <div class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <i class="fas fa-home"></i> 
              <span>Dashboard</span>
            </a>
          </div>
          <div class="user-info">
            <div class="user-details">
              <div class="user-email">
                <i class="fas fa-user"></i>
                {{ authService.getCurrentUserValue()?.email }}
              </div>
              <div class="user-role">
                <i class="fas fa-user-shield"></i>
                {{ authService.getCurrentUserValue()?.role }}
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main [class.with-nav]="authService.isAuthenticated()">
        <router-outlet></router-outlet>
        <app-toast></app-toast>
      </main>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-wrapper {
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: rgba(255, 255, 255, 0.95);
      padding: 16px 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      
      i {
        color: #667eea;
        font-size: 1.75rem;
      }
    }

    .nav-links {
      display: flex;
      gap: 16px;
      align-items: center;

      a {
        color: #4a5568;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          background: #f7fafc;
          color: #667eea;
          transform: translateY(-1px);
        }

        &.active {
          background: #667eea;
          color: white;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);

          &:hover {
            background: #5a67d8;
            transform: translateY(-1px);
          }
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-left: 20px;
      border-left: 1px solid #e2e8f0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-email, .user-role {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #4a5568;

      i {
        color: #667eea;
        font-size: 1rem;
      }
    }

    .user-role {
      font-size: 0.75rem;
      padding: 2px 8px;
      background: #ebf4ff;
      border-radius: 12px;
      color: #4c51bf;
      text-transform: capitalize;
    }

    .logout-btn {
      background: none;
      border: 1px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 8px;
      color: #4a5568;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;

      i {
        font-size: 1rem;
      }

      &:hover {
        background: #fff5f5;
        border-color: #f56565;
        color: #e53e3e;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    main {
      flex: 1;
      height: calc(100vh - 64px);
      overflow-y: auto;
      width: 100%;
      position: relative;
    }

    main.with-nav {
      height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 12px 16px;
      }

      .nav-content {
        flex-direction: column;
        gap: 16px;
      }

      .nav-links {
        width: 100%;
        justify-content: center;

        a {
          width: 100%;
          justify-content: center;
        }
      }

      .user-info {
        width: 100%;
        flex-direction: column;
        padding: 0;
        border: none;
        gap: 12px;
      }

      .user-details {
        align-items: center;
      }

      .logout-btn {
        width: 100%;
        justify-content: center;
      }

      main.with-nav {
        height: calc(100vh - 200px);
      }
    }
  `]
})
export class AppComponent {
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
