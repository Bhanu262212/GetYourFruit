import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
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

  /** Get current user snapshot */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Get authentication status snapshot */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login with credentials.
   * Backend endpoint: GET /validate?Username=...&Password=...
   * Returns the User object on success, 401 on failure.
   */
  login(credentials: LoginRequest): Observable<User> {
    const params = new HttpParams()
      .set('Username', credentials.username)
      .set('Password', credentials.password);

    return this.http.get<User>(`${environment.apiUrl}/validate`, { params }).pipe(
      tap((user: User) => {
        this.storeAuth(user);
      })
    );
  }

  /**
   * Register a new account.
   * Backend endpoint: POST /saveUser
   * Body: User entity (username, email, password, phoneNumber, etc.)
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/saveUser`, data);
  }

  /**
   * Fetch authenticated user's profile.
   * Backend endpoint: GET /getUserDetails?username=...
   */
  fetchProfile(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.username) {
      return of(null as any);
    }

    const params = new HttpParams().set('username', currentUser.username);
    return this.http.get<User>(`${environment.apiUrl}/getUserDetails`, { params }).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  /** Logout — clear session (local only, no backend endpoint needed) */
  logout(): Observable<any> {
    this.clearAuth();
    return of(null);
  }

  /** Store authentication data locally */
  private storeAuth(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      // Keep legacy keys for backward compatibility with cart / interceptor
      localStorage.setItem('username', user.username);
      if (user.id) {
        localStorage.setItem('userId', user.id);
      }
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /** Remove all auth data */
  private clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
