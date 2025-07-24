import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminService, UserRole } from '../../../../services/admin.service';
import { ToastService } from '../../../../services/toast.service';
import { ExtendedPendingSignup, getRoleIcon, getRoleClass, getTimeElapsed } from '../shared/admin.types';

@Component({
  selector: 'app-pending-signups',
  templateUrl: './pending-signups.component.html',
  styleUrls: ['./pending-signups.component.scss']
})
export class PendingSignupsComponent implements OnInit {
  @Output() roleDialogRequest = new EventEmitter<ExtendedPendingSignup>();

  pendingSignups: ExtendedPendingSignup[] = [];
  selectedPendingRoleIndex = -1;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadPendingSignups();
  }

  loadPendingSignups() {
    this.adminService.getPendingSignups().subscribe({
      next: (signups) => this.pendingSignups = signups,
      error: (err) => {
        console.error('Error loading pending signups:', err);
        this.toastService.showError('Failed to load pending signups');
      }
    });
  }

  processSignup(signupId: number, action: 'approve' | 'reject', role?: UserRole) {
    this.adminService.processSignup(signupId, action, role).subscribe({
      next: () => {
        this.toastService.showSuccess(`Signup ${action}ed successfully`);
        this.loadPendingSignups();
      },
      error: (err: Error) => {
        this.toastService.showError(`Failed to ${action} signup`);
        console.error(`Error ${action}ing signup:`, err);
      }
    });
  }

  openPendingRoleDialog(signup: ExtendedPendingSignup) {
    this.roleDialogRequest.emit(signup);
  }

  getRoleIcon = getRoleIcon;
  getRoleClass = getRoleClass;
  getTimeElapsed = getTimeElapsed;
}
