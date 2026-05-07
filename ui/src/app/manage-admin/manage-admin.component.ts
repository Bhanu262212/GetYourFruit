import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { CartService, EnrichedCartItem } from '../services/cart.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ManageAdminComponent implements OnInit, OnDestroy {
  // Header state
  isMobileMenuOpen = false;
  isCartOpen = false;
  cartItemCount = 0;
  cartItems: EnrichedCartItem[] = [];
  isLoggedIn = false;
  isAdmin = false;

  // User management
  users: User[] = [];
  isLoadingUsers = true;
  editingUserId: string | null = null;
  editRole = '';
  userSaveSuccess = '';
  userSaveError = '';

  // Product registration
  newProduct = {
    productName: '',
    price: 0,
    imageUrl: '',
    stockStatus: 'In Stock',
    avgUserRating: 0
  };
  productSaveSuccess = '';
  productSaveError = '';
  isSavingProduct = false;

  private cartCountSub!: Subscription;
  private cartItemsSub!: Subscription;
  private authSub!: Subscription;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Auth state
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
    });

    // Cart subscriptions
    this.cartCountSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    // Load users
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.cartCountSub?.unsubscribe();
    this.cartItemsSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  // ─── User Management ───
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  startEdit(user: User): void {
    this.editingUserId = user.id;
    this.editRole = user.role || 'user';
    this.userSaveSuccess = '';
    this.userSaveError = '';
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editRole = '';
  }

  saveUserRole(user: User): void {
    this.userSaveSuccess = '';
    this.userSaveError = '';
    this.adminService.updateUserRole({ id: user.id, role: this.editRole }).subscribe({
      next: (updatedUser) => {
        // Update in local list
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          this.users[idx] = { ...this.users[idx], role: updatedUser.role };
        }
        this.editingUserId = null;
        this.userSaveSuccess = `Role updated for ${user.username}`;
        setTimeout(() => this.userSaveSuccess = '', 3000);
      },
      error: () => {
        this.userSaveError = 'Failed to update role. Please try again.';
        setTimeout(() => this.userSaveError = '', 3000);
      }
    });
  }

  // ─── Product Registration ───
  saveProduct(): void {
    this.productSaveSuccess = '';
    this.productSaveError = '';

    if (!this.newProduct.productName || !this.newProduct.price || !this.newProduct.imageUrl) {
      this.productSaveError = 'Please fill in Product Name, Price, and Image URL.';
      setTimeout(() => this.productSaveError = '', 4000);
      return;
    }

    this.isSavingProduct = true;
    this.adminService.saveProduct(this.newProduct).subscribe({
      next: () => {
        this.productSaveSuccess = 'Product saved successfully!';
        this.newProduct = {
          productName: '',
          price: 0,
          imageUrl: '',
          stockStatus: 'In Stock',
          avgUserRating: 0
        };
        this.isSavingProduct = false;
        setTimeout(() => this.productSaveSuccess = '', 4000);
      },
      error: () => {
        this.productSaveError = 'Failed to save product. Please try again.';
        this.isSavingProduct = false;
        setTimeout(() => this.productSaveError = '', 4000);
      }
    });
  }

  // ─── Header helpers ───
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
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
}
