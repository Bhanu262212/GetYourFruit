import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
    private authService: AuthService,
    private router: Router
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
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
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
    // Cart is server-backed — require login.
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    // "Buy Now" → add to cart and proceed to the cart / checkout page.
    this.cartService.addToCart(product).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: () => this.router.navigate(['/cart'])
    });
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      // Refresh cart data when opening drawer
      this.cartService.refreshCart();
    }
    this.updateBodyScrollLock();
  }

  closeCart(): void {
    this.isCartOpen = false;
    this.updateBodyScrollLock();
  }

  /**
   * Prevent background scroll while a mobile overlay (cart drawer / mobile menu)
   * is open — important for native-feeling mobile UX.
   */
  private updateBodyScrollLock(): void {
    if (typeof document === 'undefined') return;
    const shouldLock = this.isCartOpen || this.isMobileMenuOpen;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
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
    this.updateBodyScrollLock();
  }

  /**
   * Handler for the "Buy Fruits" nav links.
   *  - If we're already on /products, smoothly scroll to the shop section
   *    (RouterLink alone is a no-op when navigating to the current URL).
   *  - Otherwise, route to /products as normal.
   */
  goToProducts(event?: Event): void {
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }

    if (this.router.url === '/products' || this.router.url.startsWith('/products?')) {
      event?.preventDefault();
      if (typeof document !== 'undefined') {
        const target = document.getElementById('shopSection');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    this.router.navigate(['/products']);
  }
}
