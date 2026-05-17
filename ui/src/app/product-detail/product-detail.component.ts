import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../models/product';
import { Rating } from '../models/rating.model';
import { ProductService } from '../services/product.service';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { RatingService } from '../services/rating.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  /** Hard cap on the number of packs a user can add at once. */
  readonly MAX_PACKS = 10;

  product: Product | null = null;
  activeImage: string = '';
  /** The pack size the user picked from the dropdown (e.g. 1 kg). */
  selectedPackSize: number = 1;
  /** How many of that pack the user wants — bound to the +/- counter. */
  packsCount: number = 1;
  isLoading: boolean = true;
  notFound: boolean = false;
  isLoggedIn: boolean = false;
  cartItemCount: number = 0;
  justAdded: boolean = false;

  isCartOpen: boolean = false;
  cartItems: EnrichedCartItem[] = [];

  /** Flashed beside the stepper when the user tries to go past MAX_PACKS. */
  maxReached: boolean = false;
  private maxReachedTimer?: any;

  ratings: Rating[] = [];
  averageRating: number = 0;
  isLoadingRatings: boolean = false;

  newRatingValue: number = 0;
  hoverRatingValue: number = 0;
  newFeedback: string = '';
  isSubmittingRating: boolean = false;
  ratingSubmitError: string = '';
  ratingSubmitSuccess: boolean = false;

  private routeSub?: Subscription;
  private cartCountSub?: Subscription;
  private cartItemsSub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
        this.loadRatings(id);
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

    this.cartService.refreshCart();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.cartCountSub?.unsubscribe();
    this.cartItemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
    if (this.maxReachedTimer) clearTimeout(this.maxReachedTimer);
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
          // Default the selected pack size to the first option from the backend
          // so what we add to the cart matches the available pack sizes.
          const qtys = product.availableQuantities;
          if (qtys && qtys.length > 0) {
            this.selectedPackSize = qtys[0];
          }
          this.packsCount = 1;
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

  private loadRatings(productId: string): void {
    this.isLoadingRatings = true;
    this.ratingService.getRatingsForProduct(productId).subscribe({
      next: (list) => {
        this.ratings = list || [];
        this.recomputeAverage();
        this.isLoadingRatings = false;
      },
      error: () => {
        this.ratings = [];
        this.isLoadingRatings = false;
      }
    });
  }

  private recomputeAverage(): void {
    if (!this.ratings.length) {
      this.averageRating = this.product?.avgUserRating ?? 0;
      return;
    }
    const sum = this.ratings.reduce((acc, r) => acc + (r.userRating || 0), 0);
    this.averageRating = sum / this.ratings.length;
  }

  setActiveImage(url: string): void {
    this.activeImage = url;
  }

  /** Display "KG" or "gm" based on what the backend specifies. */
  get unitLabel(): string {
    const raw = (this.product?.weighingScale || 'kg').trim();
    const lower = raw.toLowerCase();
    if (lower === 'kg') return 'KG';
    if (lower === 'gm' || lower === 'g' || lower === 'gram' || lower === 'grams') return 'gm';
    return raw;
  }

  /** True when the backend supplied a list of allowed pack sizes. */
  hasQuantityOptions(): boolean {
    return !!this.product?.availableQuantities && this.product.availableQuantities.length > 0;
  }

  onPackSizeChange(value: string | number): void {
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed > 0) {
      this.selectedPackSize = parsed;
    }
  }

  incrementPacks(): void {
    if (this.packsCount < this.MAX_PACKS) {
      this.packsCount++;
      return;
    }
    // Already at the cap — flash a shaking warning chip beside the stepper.
    // We toggle off → on (via setTimeout) so *ngIf remounts the element and
    // the CSS shake animation restarts cleanly on every click.
    this.maxReached = false;
    if (this.maxReachedTimer) clearTimeout(this.maxReachedTimer);
    setTimeout(() => {
      this.maxReached = true;
      this.maxReachedTimer = setTimeout(() => (this.maxReached = false), 2200);
    }, 10);
  }

  decrementPacks(): void {
    if (this.packsCount > 1) this.packsCount--;
  }

  /** Total units (e.g. KG) being purchased = pack size × packs count. */
  get totalUnits(): number {
    return Math.max(1, this.selectedPackSize) * Math.max(1, this.packsCount);
  }

  /** Total amount = price-per-unit × total units. */
  get totalPrice(): number {
    return (this.product?.price || 0) * this.totalUnits;
  }

  private cartQuantity(): number {
    // Cart.quantity is the total number of weighing units (KG / gm) the
    // customer is buying, so the cart drawer's "price × quantity" stays accurate.
    return this.totalUnits;
  }

  addToCart(): void {
    if (!this.product) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(this.product, this.cartQuantity()).subscribe({
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

    this.cartService.addToCart(this.product, this.cartQuantity()).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: () => this.router.navigate(['/cart'])
    });
  }

  private flashAdded(): void {
    this.justAdded = true;
    setTimeout(() => (this.justAdded = false), 1800);
  }

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
    return this.averageRating || this.product?.avgUserRating || this.product?.rating || 0;
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

  /** ── New-rating widget ───────────────────────────── */
  setNewRating(value: number): void {
    this.newRatingValue = value;
  }

  setHoverRating(value: number): void {
    this.hoverRatingValue = value;
  }

  submitRating(): void {
    if (!this.product) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.newRatingValue < 1 || this.newRatingValue > 5) {
      this.ratingSubmitError = 'Please pick a star rating between 1 and 5.';
      return;
    }

    const user = this.authService.currentUser;
    if (!user || !user.id) {
      this.ratingSubmitError = 'Could not identify your account. Please log in again.';
      return;
    }

    const payload: Rating = {
      productId: this.product.id,
      userId: user.id,
      username: user.fullName || user.username,
      userRating: this.newRatingValue,
      feedbackMessage: this.newFeedback?.trim() || ''
    };

    this.isSubmittingRating = true;
    this.ratingSubmitError = '';
    this.ratingSubmitSuccess = false;

    this.ratingService.saveRating(payload).subscribe({
      next: (saved) => {
        this.ratings = [saved, ...this.ratings];
        this.recomputeAverage();
        this.newFeedback = '';
        this.newRatingValue = 0;
        this.hoverRatingValue = 0;
        this.isSubmittingRating = false;
        this.ratingSubmitSuccess = true;
        setTimeout(() => (this.ratingSubmitSuccess = false), 2500);
      },
      error: () => {
        this.isSubmittingRating = false;
        this.ratingSubmitError = 'Sorry, we could not submit your rating. Please try again.';
      }
    });
  }

  trackByRatingId(_index: number, rating: Rating): string {
    return rating.id || `${rating.userId}-${rating.createdAt}`;
  }
}
