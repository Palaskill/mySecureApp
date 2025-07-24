import { Component, OnInit } from '@angular/core';
import { AdminService, User, PendingSignup, DeletedUser } from '../../services/admin.service';
import { AdminSection } from './sections/shared/admin.types';
import { UserRole } from '../../models/user-role.enum';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Section management
  currentSection: AdminSection = 'users';
  
  // Data arrays
  users: User[] = [];
  pendingSignups: PendingSignup[] = [];
  rejectedAccounts: PendingSignup[] = [];
  deletedUsers: DeletedUser[] = [];

  // Counts for sidenav
  userCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  deletedCount = 0;

  // Dialog states
  showPasswordDialog = false;
  showRoleDialog = false;
  showDeleteDialog = false;

  // Dialog data
  selectedUser: any = null;
  selectedPendingSignup: any = null;
  newPassword = '';
  tempSelectedRole: UserRole | null = null;
  deletionReason = '';
  roles = Object.values(UserRole);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    forkJoin({
      users: this.adminService.getUsers(),
      pending: this.adminService.getPendingSignups(),
      rejected: this.adminService.getRejectedAccounts(),
      deleted: this.adminService.getDeletedUsers()
    }).subscribe({
      next: (data) => {
        this.users = data.users;
        this.pendingSignups = data.pending;
        this.rejectedAccounts = data.rejected;
        this.deletedUsers = data.deleted;
        this.updateCounts();
      }
    });
  }

  updateCounts() {
    this.userCount = this.users.length;
    this.pendingCount = this.pendingSignups.length;
    this.rejectedCount = this.rejectedAccounts.length;
    this.deletedCount = this.deletedUsers.length;
  }

  setCurrentSection(section: AdminSection) {
    this.currentSection = section;
  }

  // Dialog management
  openRoleDialog(user: any) {
    this.selectedUser = user;
    this.tempSelectedRole = user.role;
    this.showRoleDialog = true;
  }

  openPendingRoleDialog(signup: any) {
    this.selectedPendingSignup = signup;
    this.tempSelectedRole = UserRole.USER;
    this.showRoleDialog = true;
  }

  openChangePasswordDialog(user: any) {
    this.selectedUser = user;
    this.newPassword = '';
    this.showPasswordDialog = true;
  }

  openDeleteDialog(user: any) {
    this.selectedUser = user;
    this.deletionReason = '';
    this.showDeleteDialog = true;
  }

  closeRoleDialog() {
    this.showRoleDialog = false;
    this.selectedUser = null;
    this.selectedPendingSignup = null;
    this.tempSelectedRole = null;
  }

  closePasswordDialog() {
    this.showPasswordDialog = false;
    this.selectedUser = null;
    this.newPassword = '';
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.selectedUser = null;
    this.deletionReason = '';
  }

  // Role management
  selectRole(user: any, role: UserRole) {
    this.tempSelectedRole = role;
  }

  saveRole() {
    if (!this.tempSelectedRole) return;

    if (this.selectedUser) {
      this.adminService.updateUserRole(this.selectedUser.id, this.tempSelectedRole).subscribe({
        next: () => {
          this.loadAllData();
          this.closeRoleDialog();
        }
      });
    } else if (this.selectedPendingSignup) {
      this.adminService.updatePendingSignupRole(this.selectedPendingSignup.id, this.tempSelectedRole).subscribe({
        next: () => {
          this.loadAllData();
          this.closeRoleDialog();
        }
      });
    }
  }

  // Password management
  changePassword() {
    if (!this.selectedUser || !this.newPassword) return;

    this.adminService.changeUserPassword(this.selectedUser.id, this.newPassword).subscribe({
      next: () => {
        this.closePasswordDialog();
      }
    });
  }

  // User deletion
  deleteUser() {
    if (!this.selectedUser) return;

    this.adminService.deleteUser(this.selectedUser.id, this.deletionReason).subscribe({
      next: () => {
        this.loadAllData();
        this.closeDeleteDialog();
      }
    });
  }

  // Role icon helper
  getRoleIcon(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'fa-user-shield';
      case UserRole.CHIEF: return 'fa-user-tie';
      case UserRole.BOSS: return 'fa-user-graduate';
      case UserRole.OPERATOR: return 'fa-user-cog';
      default: return 'fa-user';
    }
  }
} 