import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.errorMsg = '';

    if (!this.username || !this.password) {
        this.errorMsg = 'Username and password are required.';
        return;
    }

    this.http.get(`${environment.apiUrl}/validate?Username=${this.username}&Password=${this.password}`).subscribe({
      next: (user: any) => {
        if (user && user.username) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('username', user.username);
            localStorage.setItem('userId', user.id);
          }
          this.router.navigate(['/home']);
        } else {
          this.errorMsg = 'Invalid username or password.';
        }
      },
      error: (err) => {
        console.error('Login error', err);
        if (err.status === 401) {
            this.errorMsg = 'Invalid username or password.';
        } else {
            // Fallback for demo purposes if backend isn't ready, or handle error
            this.errorMsg = 'Error communicating with server.';
        }
      }
    });
  }
}
