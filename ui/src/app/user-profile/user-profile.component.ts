import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  treeMaturity = 0; // percentage
  harvestHistory: any[] = [];
  showOverlay = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const username = localStorage.getItem('username');
      if (!username) {
        this.router.navigate(['/login']);
        return;
      }

      this.http.get(`${environment.apiUrl}/getUserDetails?username=${username}`).subscribe({
        next: (userData: any) => {
          this.user = userData;
          // Mock data for tree maturity and harvest history for visual completeness
          this.treeMaturity = Math.floor(Math.random() * 50) + 50;
          this.harvestHistory = [
            { date: '2023-09-15', amount: 3, total: 45.00 },
            { date: '2023-10-02', amount: 1, total: 15.00 }
          ];

          // Entrance animation
          setTimeout(() => this.animateEntrance(), 100);
        },
        error: (err) => {
          console.error('Error fetching user details', err);
          // Fallback for visual testing if api fails
          this.user = { username: username, email: 'user@southerngroves.com' };
          this.treeMaturity = 75;
        }
      });
    }
  }

  animateEntrance() {
    gsap.fromTo('.profile-container',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.tree-fill',
      { width: '0%' },
      { width: `${this.treeMaturity}%`, duration: 1.5, delay: 0.5, ease: 'power2.out' }
    );
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    // Peel away animation before navigating
    gsap.to('.profile-container', {
      rotation: 15,
      y: 500,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }
}