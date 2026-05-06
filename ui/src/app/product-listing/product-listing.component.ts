import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductListingComponent implements OnInit {
  products: Product[] = [];
  cartItemCount: number = 0;
  isLoading: boolean = true;
  isMobileMenuOpen: boolean = false;
  private searchTimeout: any;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.cartService.getCartCount().subscribe(count => {
      this.cartItemCount = count;
    });
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
    this.cartService.addToCart(product).subscribe(() => {
      // Success is handled by the cart service's tap operator
    });
  }

  toggleCart(): void {
    // Dispatch custom event for the cart crate component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggleCart'));
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
