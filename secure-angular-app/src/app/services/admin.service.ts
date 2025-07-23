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
  requestDate: string;
  status: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

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
} 