import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  cartItems: any[] = [];

  constructor(private router: Router) {
    // Load cart items from localStorage or service
    this.loadCart();
  }

  loadCart() {
    // Placeholder: load cart items
    this.cartItems = [];
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}

