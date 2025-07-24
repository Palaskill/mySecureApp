import { Component, OnInit } from '@angular/core';
import { AdminService, UserRole } from '../../../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';
import { ExtendedPendingSignup, getRoleIcon, getRoleClass } from '../shared/admin.types';

@Component({
  selector: 'app-rejected-accounts',
  templateUrl: './rejected-accounts.component.html',
  styleUrls: ['./rejected-accounts.component.scss']
})
export class RejectedAccountsComponent implements OnInit {
  rejectedAccounts: ExtendedPendingSignup[] = [];
  selectedRejectedRoleIndex = -1;
  roles = Object.values(UserRole);

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRejectedAccounts();
  }

  loadRejectedAccounts() {
    this.adminService.getRejectedAccounts().subscribe({
      next: (accounts) => this.rejectedAccounts = accounts,
      error: (err) => {
        console.error('Error loading rejected accounts:', err);
        this.toastService.showError('Failed to load rejected accounts');
      }
    });
  }

  toggleRejectedRoleSelect(id: number) {
    this.selectedRejectedRoleIndex = this.selectedRejectedRoleIndex === id ? -1 : id;
  }

  selectRoleForAccount(account: ExtendedPendingSignup, role: UserRole) {
    account.selectedRole = role;
    this.selectedRejectedRoleIndex = -1;
  }

  reapproveAccount(account: ExtendedPendingSignup) {
    if (!account.selectedRole) return;
    
    this.adminService.reapproveAccount(account.id, account.selectedRole).subscribe({
      next: () => {
        this.toastService.showSuccess('Account reapproved successfully');
        this.loadRejectedAccounts();
      },
      error: (err: Error) => {
        this.toastService.showError('Failed to reapprove account');
        console.error('Error reapproving account:', err);
      }
    });
  }

  getRoleIcon = getRoleIcon;
  getRoleClass = getRoleClass;
}
