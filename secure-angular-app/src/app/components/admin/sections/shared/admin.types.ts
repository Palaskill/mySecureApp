import { UserRole, PendingSignup } from '../../../../services/admin.service';

export type AdminSection = 'users' | 'pending' | 'rejected' | 'deleted';

export interface ExtendedPendingSignup extends PendingSignup {
  selectedRole?: UserRole;
}

export const roleOptions = [
  { value: UserRole.USER, icon: 'fa-user', label: 'User' },
  { value: UserRole.OPERATOR, icon: 'fa-cog', label: 'Operator' },
  { value: UserRole.BOSS, icon: 'fa-user-tie', label: 'Boss' },
  { value: UserRole.CHIEF, icon: 'fa-crown', label: 'Chief' },
  { value: UserRole.ADMIN, icon: 'fa-shield-alt', label: 'Admin' }
];

export function getRoleIcon(role?: UserRole | string): string {
  switch(role?.toLowerCase()) {
    case 'user': return 'fa-user';
    case 'operator': return 'fa-cog';
    case 'boss': return 'fa-user-tie';
    case 'chief': return 'fa-crown';
    case 'admin': return 'fa-shield-alt';
    default: return 'fa-user';
  }
}

export function getRoleClass(role?: UserRole | string): string {
  return (role?.toLowerCase() || 'user') as string;
}

export function getTimeElapsed(date: string | Date): string {
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