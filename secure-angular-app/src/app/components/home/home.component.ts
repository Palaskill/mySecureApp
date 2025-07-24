import { Component, OnInit } from '@angular/core';
import { AdminService, UserRole, User, PendingSignup, DeletedUser } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

type AdminSection = 'users' | 'pending' | 'rejected' | 'deleted';

interface ExtendedPendingSignup extends PendingSignup {
  selectedRole?: UserRole;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAdmin = false;
  currentSection: AdminSection = 'users';
  showRoleDialog = false;
  showDeleteDialog = false;
  selectedUser: User | null = null;
  selectedPendingSignup: ExtendedPendingSignup | null = null;
  roles = Object.values(UserRole);
  tempSelectedRole: UserRole | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  pendingSignups: ExtendedPendingSignup[] = [];
  showPasswordDialog = false;
  newPassword = '';
  rejectedAccounts: ExtendedPendingSignup[] = [];
  UserRole = UserRole; // Expose enum to template
  selectedRoleFilter = '';
  selectedStatusFilter = '';
  searchQuery = '';
  selectedPendingRoleIndex = -1;
  selectedRejectedRoleIndex = -1;
  deletionReason = '';
  deletedUsers: DeletedUser[] = [];
  roleOptions = [
    { value: UserRole.USER, icon: 'fa-user', label: 'User' },
    { value: UserRole.OPERATOR, icon: 'fa-cog', label: 'Operator' },
    { value: UserRole.BOSS, icon: 'fa-user-tie', label: 'Boss' },
    { value: UserRole.CHIEF, icon: 'fa-crown', label: 'Chief' },
    { value: UserRole.ADMIN, icon: 'fa-shield-alt', label: 'Admin' }
  ];

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  setCurrentSection(section: AdminSection) {
    this.currentSection = section;
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadUsers();
      this.loadPendingSignups();
      this.loadRejectedAccounts();
      this.loadDeletedUsers();
    }
  }

  private loadPendingSignups() {
    this.adminService.getPendingSignups().subscribe({
      next: (signups) => this.pendingSignups = signups,
      error: (err) => {
        console.error('Error loading pending signups:', err);
        this.toastService.showError('Failed to load pending signups');
      }
    });
  }

  private loadRejectedAccounts() {
    this.adminService.getRejectedAccounts().subscribe({
      next: (accounts) => this.rejectedAccounts = accounts,
      error: (err) => {
        console.error('Error loading rejected accounts:', err);
        this.toastService.showError('Failed to load rejected accounts');
      }
    });
  }

  private loadDeletedUsers() {
    this.adminService.getDeletedUsers().subscribe({
      next: (users) => this.deletedUsers = users,
      error: (err) => {
        console.error('Error loading deleted users:', err);
        this.toastService.showError('Failed to load deleted users');
      }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = !this.selectedRoleFilter || 
        user.role.toLowerCase() === this.selectedRoleFilter.toLowerCase();
      const matchesStatus = !this.selectedStatusFilter || 
        user.status.toLowerCase() === this.selectedStatusFilter.toLowerCase();
      const matchesSearch = !this.searchQuery || 
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters(); // Apply filters after loading
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to load users');
        console.error('Error loading users:', err);
      }
    });
  }

  openRoleDialog(user: User) {
    this.selectedUser = user;
    this.tempSelectedRole = user.role as UserRole;
    this.showRoleDialog = true;
  }

  openPendingRoleDialog(signup: ExtendedPendingSignup) {
    this.selectedPendingSignup = signup;
    this.tempSelectedRole = signup.selectedRole || null;
    this.showRoleDialog = true;
  }

  closeRoleDialog() {
    this.showRoleDialog = false;
    this.selectedUser = null;
    this.selectedPendingSignup = null;
    this.tempSelectedRole = null;
  }

  selectRole(user: User | null, role: UserRole) {
    this.tempSelectedRole = role;
  }

  openChangePasswordDialog(user: User) {
    this.selectedUser = user;
    this.showPasswordDialog = true;
    this.newPassword = '';
  }

  closePasswordDialog() {
    this.showPasswordDialog = false;
    this.selectedUser = null;
    this.newPassword = '';
  }

  changePassword() {
    if (this.selectedUser && this.newPassword) {
      this.adminService.changeUserPassword(this.selectedUser.id, this.newPassword).subscribe({
        next: () => {
          this.toastService.showSuccess(`Password changed for ${this.selectedUser?.email}`);
          this.closePasswordDialog();
        },
        error: (err: Error) => {
          this.toastService.showError('Failed to change password');
          console.error('Error changing password:', err);
        }
      });
    }
  }

  reapproveAccount(account: ExtendedPendingSignup) {
    if (!account.selectedRole) return;
    
    this.adminService.reapproveAccount(account.id, account.selectedRole).subscribe({
      next: () => {
        this.toastService.showSuccess('Account reapproved successfully');
        this.loadRejectedAccounts();
        this.loadUsers();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to reapprove account');
        console.error('Error reapproving account:', err);
      }
    });
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.adminService.updateUser(user.id, newStatus, user.role as UserRole).subscribe({
      next: () => {
        this.toastService.showSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        this.loadUsers();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to update user status');
        console.error('Error updating status:', err);
      }
    });
  }

  togglePendingRoleSelect(id: number) {
    this.selectedPendingRoleIndex = this.selectedPendingRoleIndex === id ? -1 : id;
  }

  selectRoleForPending(signup: ExtendedPendingSignup, role: UserRole | undefined) {
    if (role) {
      signup.selectedRole = role;
      this.selectedPendingRoleIndex = -1;
    }
  }

  toggleRejectedRoleSelect(id: number) {
    this.selectedRejectedRoleIndex = this.selectedRejectedRoleIndex === id ? -1 : id;
  }

  selectRoleForAccount(account: ExtendedPendingSignup, role: UserRole) {
    account.selectedRole = role;
    this.selectedRejectedRoleIndex = -1;
  }

  processSignup(signupId: number, action: 'approve' | 'reject', role?: UserRole) {
    this.adminService.processSignup(signupId, action, role).subscribe({
      next: () => {
        this.toastService.showSuccess(`Signup ${action}ed successfully`);
        this.loadPendingSignups();
        this.loadRejectedAccounts();
        if (action === 'approve') this.loadUsers();
      },
      error: (err: Error) => {
        this.toastService.showError(`Failed to ${action} signup`);
        console.error(`Error ${action}ing signup:`, err);
      }
    });
  }

  openDeleteDialog(user: User) {
    this.selectedUser = user;
    this.deletionReason = '';
    this.showDeleteDialog = true;
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.selectedUser = null;
    this.deletionReason = '';
  }

  deleteUser() {
    if (this.selectedUser) {
      this.adminService.deleteUser(this.selectedUser.id, this.deletionReason).subscribe({
        next: () => {
          this.toastService.showSuccess('User deleted successfully');
          this.closeDeleteDialog();
          this.loadUsers();
          this.loadDeletedUsers();
        },
        error: (err: Error) => {
          this.toastService.showError('Failed to delete user');
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  getRoleIcon(role?: UserRole | string): string {
    switch(role?.toLowerCase()) {
      case 'user': return 'fa-user';
      case 'operator': return 'fa-cog';
      case 'boss': return 'fa-user-tie';
      case 'chief': return 'fa-crown';
      case 'admin': return 'fa-shield-alt';
      default: return 'fa-user';
    }
  }

  getRoleClass(role?: UserRole | string): string {
    return (role?.toLowerCase() || 'user') as string;
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  getTimeElapsed(date: string | Date): string {
    const requestDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - requestDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  saveRole() {
    if (this.selectedUser && this.tempSelectedRole) {
      this.adminService.updateUser(
        this.selectedUser.id,
        this.selectedUser.status,
        this.tempSelectedRole
      ).subscribe({
        next: () => {
          this.toastService.showSuccess('Role updated successfully');
          this.closeRoleDialog();
          this.loadUsers();
        },
        error: (err: Error) => {
          this.toastService.showError('Failed to update role');
          console.error('Error updating role:', err);
        }
      });
    } else if (this.selectedPendingSignup && this.tempSelectedRole) {
      this.selectedPendingSignup.selectedRole = this.tempSelectedRole;
      this.closeRoleDialog();
    }
  }

  revokeUserDeletion(deletedUser: DeletedUser) {
    this.adminService.restoreUser(deletedUser.original_id).subscribe({
      next: () => {
        this.toastService.showSuccess('User restored successfully');
        this.loadUsers();
        this.loadDeletedUsers();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to restore user');
        console.error('Error restoring user:', err);
      }
    });
  }

  cleanupDeletedUsers() {
    this.adminService.cleanupDeletedUsers().subscribe({
      next: (response) => {
        if (response.deletedCount > 0) {
          this.toastService.showSuccess(`Cleaned up ${response.deletedCount} expired deleted user(s)`);
        } else {
          this.toastService.showInfo('No expired deleted users to clean up');
        }
        this.loadDeletedUsers();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to clean up deleted users');
        console.error('Error cleaning up deleted users:', err);
      }
    });
  }
} 