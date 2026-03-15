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
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber: number | null = null;
  defaultShippingAddress = '';
  city = '';
  state = '';
  zipCode = '';
  country = '';

  errorMsg = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    this.errorMsg = '';

    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Please fill out all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMsg = 'Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.';
      return;
    }

    const userPayload = {
      username: this.username,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      defaultShippingAddress: this.defaultShippingAddress,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      country: this.country
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
