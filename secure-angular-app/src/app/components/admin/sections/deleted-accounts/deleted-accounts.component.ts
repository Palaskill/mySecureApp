import { Component, OnInit } from '@angular/core';
import { AdminService, DeletedUser } from '../../../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';
import { getRoleIcon } from '../shared/admin.types';

@Component({
  selector: 'app-deleted-accounts',
  templateUrl: './deleted-accounts.component.html',
  styleUrls: ['./deleted-accounts.component.scss']
})
export class DeletedAccountsComponent implements OnInit {
  deletedUsers: DeletedUser[] = [];

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDeletedUsers();
  }

  loadDeletedUsers() {
    this.adminService.getDeletedUsers().subscribe({
      next: (users) => this.deletedUsers = users,
      error: (err) => {
        console.error('Error loading deleted users:', err);
        this.toastService.showError('Failed to load deleted users');
      }
    });
  }

  revokeUserDeletion(deletedUser: DeletedUser) {
    this.adminService.restoreUser(deletedUser.original_id).subscribe({
      next: () => {
        this.toastService.showSuccess('User restored successfully');
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

  getRoleIcon = getRoleIcon;
}
