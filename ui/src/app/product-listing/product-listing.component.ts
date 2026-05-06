import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductListingComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  cartItemCount: number = 0;
  isLoading: boolean = true;
  isMobileMenuOpen: boolean = false;
  isCartOpen: boolean = false;
  cartItems: EnrichedCartItem[] = [];
  isLoggedIn: boolean = false;
  private searchTimeout: any;
  private cartCountSub!: Subscription;
  private cartItemsSub!: Subscription;
  private authSub!: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    // Subscribe to auth state
    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });

    // Subscribe to cart count (reactive)
    this.cartCountSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Subscribe to enriched cart items (reactive)
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.cartCountSub?.unsubscribe();
    this.cartItemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (query.length > 0) {
        this.isLoading = true;
        this.productService.searchProducts(query).subscribe({
          next: (products) => {
            this.products = products;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.loadProducts();
      }
    }, 400);
  }

  buyNow(product: Product): void {
    if (!this.isLoggedIn) {
      // If not logged in, prompt to login
      // For now, still try (cart service handles null userId gracefully)
    }
    this.cartService.addToCart(product).subscribe({
      next: () => {
        this.isCartOpen = true;
      },
      error: () => {
        // Error already handled in service
        this.isCartOpen = true;
      }
    });
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      // Refresh cart data when opening drawer
      this.cartService.refreshCart();
    }
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  removeCartItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe();
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Placeholder: quantity available — to be integrated with backend API later
  getAvailableQty(product: Product): number {
    const hash = product.id ? product.id.charCodeAt(0) % 20 + 5 : 12;
    return hash;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
