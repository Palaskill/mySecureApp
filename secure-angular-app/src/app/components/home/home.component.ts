import { Component, OnInit } from '@angular/core';
import { AdminService, UserRole, User, PendingSignup } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

type AdminSection = 'users' | 'pending' | 'rejected';

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
  selectedUser: User | null = null;
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

  closeRoleDialog() {
    this.showRoleDialog = false;
    this.selectedUser = null;
    this.tempSelectedRole = null;
  }

  selectRole(user: User | null, role: UserRole) {
    if (user) {
      this.tempSelectedRole = role;
    }
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

  selectRoleForPending(signup: ExtendedPendingSignup, role: UserRole) {
    signup.selectedRole = role;
    this.selectedPendingRoleIndex = -1;
  }

  toggleRejectedRoleSelect(id: number) {
    this.selectedRejectedRoleIndex = this.selectedRejectedRoleIndex === id ? -1 : id;
  }

  selectRoleForAccount(account: ExtendedPendingSignup, role: UserRole) {
    account.selectedRole = role;
    this.selectedRejectedRoleIndex = -1;
    this.adminService.reapproveAccount(account.id, role).subscribe({
      next: () => {
        this.toastService.showSuccess('Account role updated successfully');
        this.loadRejectedAccounts();
        this.loadUsers();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to update account role');
        console.error('Error updating account role:', err);
        account.selectedRole = undefined; // Reset on failure
      }
    });
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
    }
  }
} 