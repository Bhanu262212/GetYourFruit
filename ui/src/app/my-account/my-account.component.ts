import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit, OnDestroy {
  // Auth state
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSub!: Subscription;
  private userSub!: Subscription;

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
    private router: Router
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
      fullName: ['', [Validators.required]],
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
      next: () => {
        this.loginLoading = false;
        this.loginSuccess = 'Login successful!';
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
      fullName: formVal.fullName,
      password: formVal.password,
      phoneNumber: formVal.phoneNumber,
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
      },
      error: (err) => {
        this.registerLoading = false;
        if (err.status === 409) {
          this.registerError = 'Username or email already exists.';
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
    const name = this.currentUser.fullName || this.currentUser.username || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  getDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.fullName || this.currentUser.username || 'User';
  }
}
