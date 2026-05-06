import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
  animations: [
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class MyAccountComponent implements OnInit, OnDestroy {
  // Auth state
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSub!: Subscription;
  private userSub!: Subscription;

  // Which form to show: 'login' or 'register'
  activeForm: 'login' | 'register' = 'login';

  // Forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  // UI state
  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterConfirmPassword = false;
  loginLoading = false;
  registerLoading = false;
  loginError = '';
  loginSuccess = '';
  registerError = '';
  registerSuccess = '';
  logoutLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Build login form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Build register form
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/)]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: [''],
      defaultShippingAddress: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['']
    });

    // If authenticated, fetch fresh profile
    if (this.isAuthenticated) {
      this.authService.fetchProfile().subscribe({
        error: () => {} // silently ignore if profile fetch fails; we still have cached data
      });
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  // ─── Toggle between login and register ─────────────────
  showLogin(): void {
    this.activeForm = 'login';
    this.registerError = '';
    this.registerSuccess = '';
  }

  showRegister(): void {
    this.activeForm = 'register';
    this.loginError = '';
    this.loginSuccess = '';
  }

  // ─── Navigate back ────────────────────────────────────
  goBack(): void {
    this.location.back();
  }

  // ─── Login ─────────────────────────────────────────────
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginLoading = true;
    this.loginError = '';
    this.loginSuccess = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (user) => {
        this.loginLoading = false;
        this.loginSuccess = 'Login successful! Welcome back.';
        // Fetch fresh profile data after login
        this.authService.fetchProfile().subscribe();
      },
      error: (err) => {
        this.loginLoading = false;
        if (err.status === 401) {
          this.loginError = 'Invalid username or password.';
        } else {
          this.loginError = 'Unable to connect. Please try again.';
        }
      }
    });
  }

  // ─── Register ──────────────────────────────────────────
  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formVal = this.registerForm.value;
    if (formVal.password !== formVal.confirmPassword) {
      this.registerError = 'Passwords do not match.';
      return;
    }

    this.registerLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const payload = {
      username: formVal.username,
      email: formVal.email,
      password: formVal.password,
      phoneNumber: formVal.phoneNumber ? parseInt(formVal.phoneNumber, 10) : undefined,
      defaultShippingAddress: formVal.defaultShippingAddress,
      city: formVal.city,
      state: formVal.state,
      zipCode: formVal.zipCode,
      country: formVal.country
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.registerLoading = false;
        this.registerSuccess = 'Account created successfully! You can now log in.';
        this.registerForm.reset();
        // Auto-switch to login after a short delay
        setTimeout(() => this.showLogin(), 2000);
      },
      error: (err) => {
        this.registerLoading = false;
        if (err.status === 409) {
          this.registerError = 'Username already exists.';
        } else if (err.status === 200 || err.status === 0) {
          // Sometimes backend returns 200 OK but it's parsed as error if content isn't JSON
          this.registerLoading = false;
          this.registerSuccess = 'Account created successfully! You can now log in.';
          this.registerForm.reset();
          setTimeout(() => this.showLogin(), 2000);
        } else {
          this.registerError = 'Registration failed. Please try again.';
        }
      }
    });
  }

  // ─── Logout ────────────────────────────────────────────
  onLogout(): void {
    this.logoutLoading = true;
    this.authService.logout().subscribe({
      next: () => {
        this.logoutLoading = false;
      },
      error: () => {
        this.logoutLoading = false;
      }
    });
  }

  // ─── Password visibility toggles ──────────────────────
  toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }
  toggleRegisterPassword(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }
  toggleRegisterConfirmPassword(): void {
    this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword;
  }

  // ─── Helper for user initials ─────────────────────────
  getUserInitials(): string {
    if (!this.currentUser) return '?';
    const name = this.currentUser.username || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  getDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.username || 'User';
  }
}
