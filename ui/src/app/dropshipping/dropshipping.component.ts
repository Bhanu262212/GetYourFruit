import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dropshipping',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './dropshipping.component.html',
  styleUrl: './dropshipping.component.css'
})
export class DropshippingComponent implements OnInit, AfterViewInit {

  products: Product[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  noResults: boolean = false;

  // Cart state
  cartItems: any[] = [];
  promoDiscountPercentage: number = 0.12; // 12%

  searchValue: string = '';
  sortOption: string = 'default';

  currentView: 'products' | 'cart' = 'products';

  showProfileMenu: boolean = false;
  showAccountDetails: boolean = false;
  userDetails: any = null;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private productService: ProductService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {}

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === '/') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
  }

  private loadAll() {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applySort();
        this.noResults = (data == null || data.length === 0);
        this.isLoading = false;
        this.searchValue = '';

        // After loading products, load the user's cart
        this.loadCart();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please check if the server is running.';
        this.isLoading = false;
        this.noResults = false;
      }
    });
  }

  private loadCart() {
    const userId = localStorage.getItem('userId');
    if (!userId || !this.products || this.products.length === 0) return;

    this.productService.getCart(userId).subscribe({
      next: (cartData) => {
        this.cartItems = [];
        for (const item of cartData) {
          const productMatch = this.products.find(p => p.id === item.productId);
          if (productMatch) {
            this.cartItems.push({
              ...productMatch,
              quantity: item.quantity,
              color: 'Silver',
              storage: '8/256'
            });
          }
        }
      },
      error: (err) => {
        console.error('Failed to load cart', err);
      }
    });
  }

  onSearch(query: string) {
    const q = query?.trim() || '';
    this.searchValue = q;

    if (q === '') {
      this.loadAll();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.productService.searchProducts(q).subscribe({
      next: (data) => {
        this.products = data || [];
        this.applySort();
        this.noResults = (this.products.length === 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Search failed. Please try again.';
        this.isLoading = false;
        this.noResults = false;
      }
    });
  }

  onSortChange(option: string) {
    this.sortOption = option;
    this.applySort();
  }

  private applySort() {
    if (!this.products || this.products.length === 0) return;

    const copy = [...this.products];
    switch (this.sortOption) {
      case 'name-asc': copy.sort((a, b) => (a.productName || '').localeCompare(b.productName || '')); break;
      case 'name-desc': copy.sort((a, b) => (b.productName || '').localeCompare(a.productName || '')); break;
      case 'price-asc': copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'price-desc': copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      default: copy.sort((a, b) => (a.id || '').localeCompare(b.id || '')); break;
    }
    this.products = copy;
  }

  // ==== CART FUNCTIONS ====

  onAddToCart(product: Product) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const existingItem = this.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      this.updateCartInBackend(product.id, existingItem.quantity, userId);
    } else {
      this.cartItems.push({
        ...product,
        quantity: 1,
        color: 'Silver', // Mock data as per UI
        storage: '8/256' // Mock data as per UI
      });
      this.updateCartInBackend(product.id, 1, userId);
    }
  }

  private updateCartInBackend(productId: string | undefined, quantity: number, userId: string) {
    if (!productId) return;
    const payload = { productId, quantity, userId };
    this.productService.updateCart(payload).subscribe({
      next: () => console.log('Cart updated successfully in backend'),
      error: (err) => console.error('Failed to update cart in backend', err)
    });
  }

  removeFromCart(index: number) {
    const item = this.cartItems[index];
    const userId = localStorage.getItem('userId');
    if (item && userId) {
      this.productService.deleteCartItem(userId, item.id).subscribe({
        next: () => {
          this.cartItems.splice(index, 1);
          console.log('Item deleted from backend cart');
        },
        error: (err) => console.error('Failed to delete item from backend cart', err)
      });
    }
  }

  clearCart() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.productService.clearCart(userId).subscribe({
        next: () => {
          this.cartItems = [];
          console.log('Cart cleared in backend');
        },
        error: (err) => console.error('Failed to clear backend cart', err)
      });
    } else {
      this.cartItems = [];
    }
  }

  increaseQty(index: number) {
    this.cartItems[index].quantity += 1;
    const item = this.cartItems[index];
    const userId = localStorage.getItem('userId');
    if (item && userId) {
      this.updateCartInBackend(item.id, item.quantity, userId);
    }
  }

  decreaseQty(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity -= 1;
      const item = this.cartItems[index];
      const userId = localStorage.getItem('userId');
      if (item && userId) {
        this.updateCartInBackend(item.id, item.quantity, userId);
      }
    }
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getDiscount(): number {
    const total = this.getTotalPrice();
    return Math.round(total * this.promoDiscountPercentage);
  }

  getTotalPayment(): number {
    return this.getTotalPrice() - this.getDiscount();
  }

  proceedToPayment() {
    alert(`Proceeding to payment... Total: $${this.getTotalPayment()}`);
    // Potentially make a backend call here to save the cart
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  viewAccountDetails() {
    this.showProfileMenu = false;
    this.showAccountDetails = true;
    this.userDetails = null;

    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.get(`${environment.apiUrl}/getUserDetails?id=${userId}`).subscribe({
        next: (data: any) => {
          this.userDetails = data;
        },
        error: (err) => {
          console.error('Error fetching user details', err);
          this.userDetails = { username: 'Error loading details' };
        }
      });
    } else {
      this.userDetails = { username: 'No user ID found' };
    }
  }

  closeAccountDetails() {
    this.showAccountDetails = false;
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.logout();
  }
}
