import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductListingComponent implements OnInit {
  products: Product[] = [];
  cartItemCount: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products;
    });
    this.cartService.getCartCount().subscribe(count => {
      this.cartItemCount = count;
    });
  }

  buyNow(product: Product): void {
    this.cartService.addToCart(product).subscribe(() => {
      // Success is handled by the cart service's tap operator
    });
  }
}
