import { Component, OnInit } from '@angular/core';
import { AdminService, PendingSignup, User, UserRole } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  UserRole = UserRole; // Make enum available in template
  pendingSignups: (PendingSignup & { selectedRole: UserRole })[] = [];
  users: (User & { newRole: UserRole })[] = [];
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPendingSignups();
    this.loadUsers();
  }

  loadPendingSignups() {
    this.adminService.getPendingSignups().subscribe({
      next: (signups) => {
        this.pendingSignups = signups.map(signup => ({
          ...signup,
          selectedRole: UserRole.USER
        }));
      },
      error: (error) => {
        this.error = error.error?.message || 'Error loading pending signups';
      }
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          newRole: user.role as UserRole
        }));
      },
      error: (error) => {
        this.error = error.error?.message || 'Error loading users';
      }
    });
  }

  processSignup(signupId: number, action: 'approve' | 'reject', role?: UserRole) {
    this.adminService.processSignup(signupId, action, role).subscribe({
      next: () => {
        this.loadPendingSignups();
        if (action === 'approve') {
          this.loadUsers();
        }
        this.error = '';
      },
      error: (error) => {
        this.error = error.error?.message || `Error ${action}ing signup`;
      }
    });
  }

  updateUser(user: User & { newRole: UserRole }) {
    this.adminService.updateUser(user.id, user.status as 'active' | 'inactive', user.newRole).subscribe({
      next: () => {
        this.loadUsers();
        this.error = '';
      },
      error: (error) => {
        this.error = error.error?.message || 'Error updating user';
        user.newRole = user.role as UserRole;
      }
    });
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.adminService.updateUser(user.id, newStatus as 'active' | 'inactive', user.role as UserRole).subscribe({
      next: () => {
        this.loadUsers();
        this.error = '';
      },
      error: (error) => {
        this.error = error.error?.message || 'Error updating user status';
      }
    });
  }
} 