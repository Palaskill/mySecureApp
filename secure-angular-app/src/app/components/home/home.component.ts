import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, UserRole, PendingSignup, User } from '../../services/admin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  UserRole = UserRole; // Make enum available in template
  isAdmin: boolean;
  pendingSignups: (PendingSignup & { selectedRole: UserRole })[] = [];
  rejectedAccounts: (PendingSignup & { selectedRole: UserRole })[] = [];
  users: (User & { newRole: UserRole })[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadPendingSignups();
      this.loadRejectedAccounts();
      this.loadUsers();
    }
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  loadPendingSignups() {
    this.adminService.getPendingSignups().subscribe({
      next: (signups) => {
        this.pendingSignups = signups.map(signup => ({
          ...signup,
          selectedRole: UserRole.USER
        }));
      }
    });
  }

  loadRejectedAccounts() {
    this.adminService.getRejectedAccounts().subscribe({
      next: (accounts: PendingSignup[]) => {
        this.rejectedAccounts = accounts.map(account => ({
          ...account,
          selectedRole: UserRole.USER
        }));
      }
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users.map((user: User) => ({
          ...user,
          newRole: user.role as UserRole
        }));
      }
    });
  }

  processSignup(signupId: number, action: 'approve' | 'reject', role?: UserRole) {
    this.adminService.processSignup(signupId, action, role).subscribe({
      next: () => {
        this.loadPendingSignups();
        this.loadRejectedAccounts();
        if (action === 'approve') {
          this.loadUsers();
        }
      }
    });
  }

  reapproveAccount(account: PendingSignup & { selectedRole: UserRole }) {
    this.adminService.reapproveAccount(account.id, account.selectedRole).subscribe({
      next: () => {
        this.loadRejectedAccounts();
        this.loadUsers();
      }
    });
  }

  updateUser(user: User & { newRole: UserRole }) {
    this.adminService.updateUser(user.id, user.status as 'active' | 'inactive', user.newRole).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        user.newRole = user.role as UserRole;
      }
    });
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.adminService.updateUser(user.id, newStatus as 'active' | 'inactive', user.role as UserRole).subscribe({
      next: () => {
        this.loadUsers();
      }
    });
  }
} 