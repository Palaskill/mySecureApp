import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum UserRole {
  USER = 'user',
  OPERATOR = 'operator',
  BOSS = 'boss',
  CHIEF = 'chief',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: Date;
}

export interface PendingSignup {
  id: number;
  email: string;
  request_date: string;
  status: string;
  notes?: string;
}

export interface DeletedUser {
  id: number;
  original_id: number;
  email: string;
  role: string;
  deleted_at: Date;
  created_at: Date;
  deletion_reason?: string;
  days_until_deletion: number;
}

export interface AdminCounts {
  users: number;
  pending: number;
  rejected: number;
  deleted: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getCounts(): Observable<AdminCounts> {
    return this.http.get<AdminCounts>(`${this.apiUrl}/counts`);
  }

  updateUserRole(userId: number, role: UserRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user-role`, { userId, role });
  }

  updatePendingSignupRole(signupId: number, role: UserRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-pending-signup-role`, { signupId, role });
  }

  getPendingSignups(): Observable<PendingSignup[]> {
    return this.http.get<PendingSignup[]>(`${this.apiUrl}/pending-signups`);
  }

  processSignup(signupId: number, action: 'approve' | 'reject', role?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-signup`, {
      signupId,
      action,
      role
    });
  }

  getRejectedAccounts(): Observable<PendingSignup[]> {
    return this.http.get<PendingSignup[]>(`${this.apiUrl}/rejected-accounts`);
  }

  reapproveAccount(id: number, role: UserRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/reapprove-account`, { id, role });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUser(id: number, status: 'active' | 'inactive', role: UserRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user`, { id, status, role });
  }

  changeUserPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-user-password`, { userId, newPassword });
  }

  deleteUser(userId: number, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-user`, { userId, reason });
  }

  getDeletedUsers(): Observable<DeletedUser[]> {
    return this.http.get<DeletedUser[]>(`${this.apiUrl}/deleted-users`);
  }

  restoreUser(originalId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore-user`, { originalId });
  }

  cleanupDeletedUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cleanup-deleted-users`, {});
  }
} 