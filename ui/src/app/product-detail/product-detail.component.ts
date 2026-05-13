import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  activeImage: string = '';
  quantity: number = 1;
  isLoading: boolean = true;
  notFound: boolean = false;
  isLoggedIn: boolean = false;
  cartItemCount: number = 0;
  justAdded: boolean = false;

  // Cart drawer state (mirrors product-listing UX)
  isCartOpen: boolean = false;
  cartItems: EnrichedCartItem[] = [];

  private routeSub?: Subscription;
  private cartCountSub?: Subscription;
  private cartItemsSub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });

    this.cartCountSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });

    // Ensure cart is up-to-date when arriving on this page
    this.cartService.refreshCart();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.cartCountSub?.unsubscribe();
    this.cartItemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.notFound = false;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.activeImage = product.imageUrl || (product.images && product.images[0]) || '';
        } else {
          this.notFound = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  setActiveImage(url: string): void {
    this.activeImage = url;
  }

  incrementQty(): void {
    if (this.quantity < 99) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product) return;

    // Cart is server-backed — users must be logged in.
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(this.product, this.quantity).subscribe({
      next: () => this.flashAdded(),
      error: () => this.flashAdded()
    });
  }

  buyNow(): void {
    if (!this.product) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(this.product, this.quantity).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: () => this.router.navigate(['/cart'])
    });
  }

  private flashAdded(): void {
    this.justAdded = true;
    setTimeout(() => (this.justAdded = false), 1800);
  }

  // ─── Cart drawer (opened only when the user taps the cart icon) ────
  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      this.cartService.refreshCart();
    }
    this.updateBodyScrollLock();
  }

  closeCart(): void {
    this.isCartOpen = false;
    this.updateBodyScrollLock();
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

  private updateBodyScrollLock(): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = this.isCartOpen ? 'hidden' : '';
  }

  starRange(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getRating(): number {
    return this.product?.rating || this.product?.avgUserRating || 0;
  }

  getGalleryImages(): string[] {
    if (!this.product) return [];
    const list: string[] = [];
    if (this.product.imageUrl) list.push(this.product.imageUrl);
    (this.product.images || []).forEach(img => {
      if (img && !list.includes(img)) list.push(img);
    });
    return list;
  }
}
