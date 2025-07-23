import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, UserRole, PendingSignup, User } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

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
  selectedUser: User | null = null;
  showPasswordDialog = false;
  newPassword = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private toastService: ToastService
  ) {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadPendingSignups();
      this.loadRejectedAccounts();
      this.loadUsers();
    }
    // Test toast on component init
    this.toastService.showInfo('Component initialized');
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
          newRole: user.role.toLowerCase() as UserRole // Convert to lowercase to match enum values
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

  openChangePasswordDialog(user: User) {
    this.selectedUser = user;
    this.showPasswordDialog = true;
    this.newPassword = '';
  }

  closePasswordDialog() {
    this.selectedUser = null;
    this.showPasswordDialog = false;
    this.newPassword = '';
  }

  changePassword() {
    if (this.selectedUser && this.newPassword) {
      this.adminService.changeUserPassword(this.selectedUser.id, this.newPassword).subscribe({
        next: () => {
          this.toastService.showSuccess(`Password successfully changed for ${this.selectedUser?.email}`);
          this.closePasswordDialog();
        },
        error: (error) => {
          this.toastService.showError('Error changing password: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }
} 