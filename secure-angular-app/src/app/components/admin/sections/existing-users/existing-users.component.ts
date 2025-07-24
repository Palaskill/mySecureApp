import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminService, User, UserRole } from '../../../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';
import { getRoleIcon, getRoleClass } from '../shared/admin.types';

@Component({
  selector: 'app-existing-users',
  templateUrl: './existing-users.component.html',
  styleUrls: ['./existing-users.component.scss']
})
export class ExistingUsersComponent implements OnInit {
  @Output() roleDialogRequest = new EventEmitter<User>();
  @Output() passwordDialogRequest = new EventEmitter<User>();
  @Output() deleteDialogRequest = new EventEmitter<User>();

  users: User[] = [];
  filteredUsers: User[] = [];
  UserRole = UserRole;
  selectedRoleFilter = '';
  selectedStatusFilter = '';
  searchQuery = '';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to load users');
        console.error('Error loading users:', err);
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

  openRoleDialog(user: User) {
    this.roleDialogRequest.emit(user);
  }

  openChangePasswordDialog(user: User) {
    this.passwordDialogRequest.emit(user);
  }

  openDeleteDialog(user: User) {
    this.deleteDialogRequest.emit(user);
  }

  getRoleIcon = getRoleIcon;
  getRoleClass = getRoleClass;
}
