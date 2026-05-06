import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  /** Restore session from localStorage on app startup */
  private loadStoredAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userJson = localStorage.getItem(this.USER_KEY);
      if (token && userJson) {
        try {
          const user: User = JSON.parse(userJson);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch {
          this.clearAuth();
        }
      }
    }
  }

  /** Get current JWT token */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /** Get current user snapshot */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Get authentication status snapshot */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /** Login with credentials */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.storeAuth(response.token, response.user);
      })
    );
  }

  /** Register a new account */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/auth/register`, data);
  }

  /** Fetch authenticated user's profile */
  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/v1/user/profile`).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  /** Logout — clear session */
  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, {}).pipe(
      tap(() => this.clearAuth()),
      catchError(() => {
        // Always clear local state even if server call fails
        this.clearAuth();
        return of(null);
      })
    );
  }

  /** Store authentication data locally */
  private storeAuth(token: string, user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      // Keep legacy keys for backward compatibility with cart / interceptor
      localStorage.setItem('username', user.username);
      localStorage.setItem('userId', user.id);
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /** Remove all auth data */
  private clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
