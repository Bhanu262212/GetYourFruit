import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

/** Per-tile purchase selection — pack size + how many of that pack. */
interface TileSelection {
  packSize: number;
  packs: number;
}

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ProductListingComponent implements OnInit, OnDestroy {
  /** Hard cap on packs per add-to-cart action. */
  readonly MAX_PACKS = 10;

  products: Product[] = [];
  cartItemCount: number = 0;
  isLoading: boolean = true;
  isMobileMenuOpen: boolean = false;
  isCartOpen: boolean = false;
  cartItems: EnrichedCartItem[] = [];
  isLoggedIn: boolean = false;
  /** Drives role-based menu items (e.g. the "Manage" link). */
  isAdmin: boolean = false;
  /** Selection state keyed by product.id so each tile remembers its own choice. */
  private selections = new Map<string, TileSelection>();
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

    // Subscribe to auth state — track both login + role so the nav can
    // expose the admin-only "Manage" entry to admins only.
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
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
        this.seedSelections(products);
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
            this.seedSelections(products);
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

  /** Make sure every product has a default tile selection. */
  private seedSelections(products: Product[]): void {
    products.forEach(p => {
      if (this.selections.has(p.id)) return;
      const qtys = p.availableQuantities;
      this.selections.set(p.id, {
        packSize: qtys && qtys.length ? qtys[0] : 1,
        packs: 1
      });
    });
  }

  private ensureSelection(product: Product): TileSelection {
    let sel = this.selections.get(product.id);
    if (!sel) {
      const qtys = product.availableQuantities;
      sel = { packSize: qtys && qtys.length ? qtys[0] : 1, packs: 1 };
      this.selections.set(product.id, sel);
    }
    return sel;
  }

  getSelectedPackSize(product: Product): number {
    return this.ensureSelection(product).packSize;
  }

  setSelectedPackSize(product: Product, value: number | string): void {
    const sel = this.ensureSelection(product);
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed > 0) sel.packSize = parsed;
  }

  getPacksCount(product: Product): number {
    return this.ensureSelection(product).packs;
  }

  incrementPacks(product: Product): void {
    const sel = this.ensureSelection(product);
    if (sel.packs < this.MAX_PACKS) sel.packs++;
  }

  decrementPacks(product: Product): void {
    const sel = this.ensureSelection(product);
    if (sel.packs > 1) sel.packs--;
  }

  /** Total units (KG / gm) being purchased = packSize × packs. */
  getTotalUnits(product: Product): number {
    const sel = this.ensureSelection(product);
    return Math.max(1, sel.packSize) * Math.max(1, sel.packs);
  }

  getTotalPrice(product: Product): number {
    return (product.price || 0) * this.getTotalUnits(product);
  }

  buyNow(product: Product): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const totalUnits = this.getTotalUnits(product);
    this.cartService.addToCart(product, totalUnits).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: () => this.router.navigate(['/cart'])
    });
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const totalUnits = this.getTotalUnits(product);
    this.cartService.addToCart(product, totalUnits).subscribe();
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

  /** Pack sizes returned by the backend, or an empty list. */
  getAvailableQuantities(product: Product): number[] {
    return product.availableQuantities ?? [];
  }

  /** "KG" / "gm" — pulled straight from the backend `weighingScale`. */
  getUnitLabel(product: Product): string {
    const raw = (product.weighingScale || 'kg').trim();
    const lower = raw.toLowerCase();
    if (lower === 'kg') return 'KG';
    if (lower === 'gm' || lower === 'g' || lower === 'gram' || lower === 'grams') return 'gm';
    return raw;
  }

  /** A render-friendly summary like "0.5 KG, 1 KG, 2 KG". */
  getPackSizesLabel(product: Product): string {
    const qtys = this.getAvailableQuantities(product);
    if (!qtys.length) return '';
    const unit = this.getUnitLabel(product);
    return qtys.map(q => `${q} ${unit}`).join(', ');
  }

  /** Best available average rating (cached on Product or fallback to legacy `rating`). */
  getAverageRating(product: Product): number {
    return product.avgUserRating ?? product.rating ?? 0;
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
