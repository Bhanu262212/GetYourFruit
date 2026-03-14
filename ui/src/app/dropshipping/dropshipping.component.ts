import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { ProductCardComponent } from '../product-card/product-card.component';

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

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private productService: ProductService, private router: Router) {}

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
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please check if the server is running.';
        this.isLoading = false;
        this.noResults = false;
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
    const existingItem = this.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        ...product,
        quantity: 1,
        color: 'Silver', // Mock data as per UI
        storage: '8/256' // Mock data as per UI
      });
    }
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
  }

  clearCart() {
    this.cartItems = [];
  }

  increaseQty(index: number) {
    this.cartItems[index].quantity += 1;
  }

  decreaseQty(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity -= 1;
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
}
