import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminSection } from '../sections/shared/admin.types';

interface NavItem {
  section: AdminSection;
  icon: string;
  text: string;
  count?: number;
}

@Component({
  selector: 'app-admin-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Input() currentSection: AdminSection = 'users';
  @Input() userCount = 0;
  @Input() pendingCount = 0;
  @Input() rejectedCount = 0;
  @Input() deletedCount = 0;
  @Output() sectionChange = new EventEmitter<AdminSection>();

  navItems: NavItem[] = [
    { section: 'users', icon: 'fas fa-users', text: 'Existing Users' },
    { section: 'pending', icon: 'fas fa-user-clock', text: 'Pending Signups' },
    { section: 'rejected', icon: 'fas fa-user-times', text: 'Rejected Accounts' },
    { section: 'deleted', icon: 'fas fa-trash-alt', text: 'Deleted Accounts' }
  ];

  getCount(section: AdminSection): number {
    switch (section) {
      case 'users': return this.userCount;
      case 'pending': return this.pendingCount;
      case 'rejected': return this.rejectedCount;
      case 'deleted': return this.deletedCount;
      default: return 0;
    }
  }

  setCurrentSection(section: AdminSection) {
    this.sectionChange.emit(section);
  }
}
