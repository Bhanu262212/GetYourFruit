import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { User } from '../models/user.model';
import { Product } from '../models/product';

/** Which tile is currently open inside the admin dashboard. */
type AdminView = 'dashboard' | 'products' | 'users' | 'products-list';

/**
 * Editable product form model — mirrors the backend Product entity.
 * `avgUserRating` is intentionally omitted: it's a derived field that
 * the system computes from real user ratings, not something an admin
 * sets at creation time.
 */
interface ProductFormModel {
  productName: string;
  price: number | null;
  imageUrl: string;
  stockStatus: string;
  weighingScale: string;
  availableQuantities: string;
}

@Component({
  selector: 'app-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ManageAdminComponent implements OnInit, OnDestroy {
  // ─── Header state (mirrors the listing header so admins see the same shell)
  isMobileMenuOpen = false;
  isCartOpen = false;
  cartItemCount = 0;
  cartItems: EnrichedCartItem[] = [];
  isLoggedIn = false;
  isAdmin = false;

  // ─── Dashboard view state
  view: AdminView = 'dashboard';

  // ─── Users
  users: User[] = [];
  isLoadingUsers = false;
  editingUserId: string | null = null;
  /** Working copy edited inside the modal — saved on confirm, discarded on cancel. */
  editUser: User | null = null;
  userSaveSuccess = '';
  userSaveError = '';
  isSavingUser = false;
  /** Free-text search across username / email / fullName / phone. */
  userSearchQuery = '';

  // ─── Product form
  productForm: ProductFormModel = this.blankProductForm();
  productSaveSuccess = '';
  productSaveError = '';
  isSavingProduct = false;

  // ─── Products list (View Product Details tile)
  productList: Product[] = [];
  isLoadingProducts = false;
  productListSaveSuccess = '';
  productListSaveError = '';
  productSearchQuery = '';
  /** Id of the product currently being edited in the modal, or null when closed. */
  editingProductId: string | null = null;
  /** Working copy of the product being edited; saved on Update, dropped on Cancel. */
  editProduct: (Product & { availableQuantitiesText?: string }) | null = null;
  isSavingProductEdit = false;

  readonly roleOptions: string[] = ['user', 'admin'];
  readonly stockOptions: string[] = ['In Stock', 'Limited Stock', 'Out of Stock'];
  readonly weighingScaleOptions: string[] = ['kg', 'gm'];

  private cartCountSub?: Subscription;
  private cartItemsSub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
      // Non-admins should never land here — bounce them to the products page.
      if (!this.isAdmin) {
        this.router.navigate(['/products']);
      }
    });

    this.cartCountSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.refreshCart();
  }

  ngOnDestroy(): void {
    this.cartCountSub?.unsubscribe();
    this.cartItemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // ─── Tile navigation ─────────────────────────────────────────
  openProducts(): void {
    this.view = 'products';
    this.resetProductForm();
  }

  openUsers(): void {
    this.view = 'users';
    if (this.users.length === 0) this.loadUsers();
  }

  openProductsList(): void {
    this.view = 'products-list';
    if (this.productList.length === 0) this.loadProducts();
  }

  backToDashboard(): void {
    this.view = 'dashboard';
    this.cancelEdit();
    this.cancelEditProduct();
    this.productSaveError = '';
    this.productSaveSuccess = '';
    this.userSaveError = '';
    this.userSaveSuccess = '';
    this.productListSaveError = '';
    this.productListSaveSuccess = '';
  }

  // ─── Product form ────────────────────────────────────────────
  private blankProductForm(): ProductFormModel {
    return {
      productName: '',
      price: null,
      imageUrl: '',
      stockStatus: 'In Stock',
      weighingScale: 'kg',
      availableQuantities: ''
    };
  }

  resetProductForm(): void {
    this.productForm = this.blankProductForm();
    this.productSaveError = '';
    this.productSaveSuccess = '';
  }

  saveProduct(): void {
    this.productSaveError = '';
    this.productSaveSuccess = '';

    if (!this.productForm.productName?.trim()) {
      this.productSaveError = 'Product name is required.';
      return;
    }
    if (this.productForm.price === null || this.productForm.price < 0) {
      this.productSaveError = 'Please enter a valid price.';
      return;
    }
    if (!this.productForm.imageUrl?.trim()) {
      this.productSaveError = 'Image URL is required.';
      return;
    }

    // Parse the comma-separated pack sizes — accept "0.5, 1, 2" or "0.5 1 2".
    const quantities = (this.productForm.availableQuantities || '')
      .split(/[,\s]+/)
      .map(token => token.trim())
      .filter(token => token.length > 0)
      .map(token => Number(token))
      .filter(num => !isNaN(num) && num > 0);

    const payload: Partial<Product> & Record<string, any> = {
      productName: this.productForm.productName.trim(),
      price: Number(this.productForm.price),
      imageUrl: this.productForm.imageUrl.trim(),
      stockStatus: this.productForm.stockStatus,
      weighingScale: this.productForm.weighingScale,
      availableQuantities: quantities
    };

    this.isSavingProduct = true;
    this.adminService.saveProduct(payload).subscribe({
      next: () => {
        this.isSavingProduct = false;
        this.productSaveSuccess = `Saved "${payload['productName']}" successfully.`;
        this.resetProductForm();
        setTimeout(() => (this.productSaveSuccess = ''), 4000);
      },
      error: () => {
        this.isSavingProduct = false;
        this.productSaveError = 'Could not save the product. Please try again.';
      }
    });
  }

  // ─── User management ─────────────────────────────────────────
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users || [];
        this.isLoadingUsers = false;
      },
      error: () => {
        this.users = [];
        this.isLoadingUsers = false;
        this.userSaveError = 'Failed to load users.';
      }
    });
  }

  startEdit(user: User): void {
    this.editingUserId = user.id;
    // Clone so cancelling doesn't mutate the table row.
    this.editUser = { ...user };
    this.userSaveSuccess = '';
    this.userSaveError = '';
    this.updateBodyScrollLock();
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editUser = null;
    this.updateBodyScrollLock();
  }

  /**
   * Filter the users table by the free-text query. Matches a substring
   * against username, email, fullName or phoneNumber so admins can find
   * a user by whichever field they remember.
   */
  get filteredUsers(): User[] {
    const q = (this.userSearchQuery || '').trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u => {
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const fullName = (u.fullName || '').toLowerCase();
      const phone = u.phoneNumber != null ? String(u.phoneNumber) : '';
      return username.includes(q) ||
             email.includes(q) ||
             fullName.includes(q) ||
             phone.includes(q);
    });
  }

  clearUserSearch(): void {
    this.userSearchQuery = '';
  }

  saveUser(): void {
    if (!this.editUser || !this.editUser.id) return;
    this.userSaveError = '';
    this.userSaveSuccess = '';
    this.isSavingUser = true;

    // Strip password from the payload — admins shouldn't be silently
    // overwriting credentials from this screen.
    const { password: _ignored, ...payload } = this.editUser;

    this.adminService.updateUser(payload as User).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex(u => u.id === updated.id);
        if (idx !== -1) {
          this.users[idx] = { ...this.users[idx], ...updated };
        }
        this.isSavingUser = false;
        this.editingUserId = null;
        this.editUser = null;
        this.updateBodyScrollLock();
        this.userSaveSuccess = `Saved changes for ${updated.username}.`;
        setTimeout(() => (this.userSaveSuccess = ''), 3000);
      },
      error: () => {
        this.isSavingUser = false;
        this.userSaveError = 'Could not save user. Please try again.';
      }
    });
  }

  // ─── Products list & edit ────────────────────────────────────
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productListSaveError = '';
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.productList = products || [];
        this.isLoadingProducts = false;
      },
      error: () => {
        this.productList = [];
        this.isLoadingProducts = false;
        this.productListSaveError = 'Failed to load products.';
      }
    });
  }

  /** Free-text filter against name, stock status and weighing scale. */
  get filteredProductList(): Product[] {
    const q = (this.productSearchQuery || '').trim().toLowerCase();
    if (!q) return this.productList;
    return this.productList.filter(p => {
      const name = (p.productName || '').toLowerCase();
      const stock = (p.stockStatus || '').toLowerCase();
      const scale = (p.weighingScale || '').toLowerCase();
      const priceStr = p.price != null ? String(p.price) : '';
      return name.includes(q) ||
             stock.includes(q) ||
             scale.includes(q) ||
             priceStr.includes(q);
    });
  }

  clearProductSearch(): void {
    this.productSearchQuery = '';
  }

  startEditProduct(product: Product): void {
    this.editingProductId = product.id;
    // Clone so cancelling discards changes without mutating the table row.
    // We also project availableQuantities (number[]) into an editable
    // comma-separated string so the modal can use a single text input.
    this.editProduct = {
      ...product,
      availableQuantitiesText: (product.availableQuantities || []).join(', ')
    };
    this.productListSaveSuccess = '';
    this.productListSaveError = '';
    this.updateBodyScrollLock();
  }

  cancelEditProduct(): void {
    this.editingProductId = null;
    this.editProduct = null;
    this.updateBodyScrollLock();
  }

  updateProduct(): void {
    if (!this.editProduct || !this.editProduct.id) return;

    if (!(this.editProduct.productName || '').trim()) {
      this.productListSaveError = 'Product name is required.';
      return;
    }
    if (this.editProduct.price == null || this.editProduct.price < 0) {
      this.productListSaveError = 'Please enter a valid price.';
      return;
    }
    if (!(this.editProduct.imageUrl || '').trim()) {
      this.productListSaveError = 'Image URL is required.';
      return;
    }

    // Parse the comma/space separated pack-size string back into number[].
    const quantities = (this.editProduct.availableQuantitiesText || '')
      .split(/[,\s]+/)
      .map(token => token.trim())
      .filter(token => token.length > 0)
      .map(token => Number(token))
      .filter(num => !isNaN(num) && num > 0);

    // Build the payload — we intentionally omit avgUserRating so it stays a
    // server-managed derived value, never overwritten from this admin form.
    const { availableQuantitiesText: _ignored, avgUserRating: _avgIgnored, ...rest } = this.editProduct;
    const payload: Product = {
      ...(rest as Product),
      productName: (this.editProduct.productName || '').trim(),
      price: Number(this.editProduct.price),
      imageUrl: (this.editProduct.imageUrl || '').trim(),
      availableQuantities: quantities
    };

    this.isSavingProductEdit = true;
    this.productListSaveError = '';
    this.productListSaveSuccess = '';

    this.adminService.updateProduct(payload).subscribe({
      next: () => {
        // Patch the row in place so the table reflects the changes immediately.
        const idx = this.productList.findIndex(p => p.id === payload.id);
        if (idx !== -1) {
          this.productList[idx] = { ...this.productList[idx], ...payload };
        }
        this.isSavingProductEdit = false;
        this.editingProductId = null;
        this.editProduct = null;
        this.updateBodyScrollLock();
        this.productListSaveSuccess = `Updated "${payload.productName}" successfully.`;
        setTimeout(() => (this.productListSaveSuccess = ''), 3500);
      },
      error: () => {
        this.isSavingProductEdit = false;
        this.productListSaveError = 'Could not update the product. Please try again.';
      }
    });
  }

  // ─── Header / cart helpers (same as the listing page) ───────
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScrollLock();
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this.cartService.refreshCart();
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
    const shouldLock = this.isCartOpen ||
                       this.isMobileMenuOpen ||
                       !!this.editingUserId ||
                       !!this.editingProductId;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
  }
}
