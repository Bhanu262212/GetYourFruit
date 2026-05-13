import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: EnrichedCartItem[] = [];
  isLoggedIn = false;

  private itemsSub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.itemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });

    this.cartService.refreshCart();
  }

  ngOnDestroy(): void {
    this.itemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe();
  }

  /** Clear all items from this user's cart (server-side). */
  clearCart(): void {
    if (this.cartItems.length === 0) return;
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Remove all items from your cart? This cannot be undone.')
      : true;
    if (!confirmed) return;
    this.cartService.clearCart().subscribe();
  }

  increment(item: EnrichedCartItem): void {
    this.cartService.updateCartItem(item.productId, item.quantity + 1).subscribe();
  }

  decrement(item: EnrichedCartItem): void {
    if (item.quantity <= 1) return;
    this.cartService.updateCartItem(item.productId, item.quantity - 1).subscribe();
  }

  getSubtotal(): number {
    return this.cartService.getCartTotal();
  }

  getShipping(): number {
    return this.getSubtotal() >= 999 || this.getSubtotal() === 0 ? 0 : 49;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  checkout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    // TODO: integrate real checkout flow
    alert('Checkout flow coming soon!');
  }
}
