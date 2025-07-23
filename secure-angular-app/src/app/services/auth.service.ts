import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

export interface User {
  userId: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'http://localhost:3000/api';
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getStoredToken());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getStoredToken(): User | null {
    const token = this.cookieService.get('jwt_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(map(response => {
        if (response && response.token) {
          this.setSession(response.token);
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          this.currentUserSubject.next(decodedToken);
        }
        return response;
      }));
  }

  signup(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, { email, password });
  }

  private setSession(token: string) {
    this.cookieService.set('jwt_token', token, {
      expires: new Date(this.jwtHelper.getTokenExpirationDate(token) as Date),
      secure: true,
      sameSite: 'Strict',
      path: '/'
    });
  }

  logout() {
    this.cookieService.delete('jwt_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.cookieService.get('jwt_token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
} 