import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    this.errorMsg = '';

    if (!this.username || !this.password) {
      this.errorMsg = 'Username and password are required.';
      return;
    }

    const userPayload = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:8080/saveUser', userPayload).subscribe({
      next: () => {
        // Assuming success means we can navigate to login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup error', err);
        if (err.status === 409) {
            this.errorMsg = 'Username already exists.';
        } else if (err.status === 200) {
            // Sometimes backend returns 200 OK but it's parsed as error if it doesn't return JSON
            this.router.navigate(['/login']);
        } else {
            this.errorMsg = 'Signup failed. Please try again.';
        }
      }
    });
  }
}
