import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class DropshippingComponent implements OnInit {

  products: Product[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        console.log('Products received:', data);
        this.products = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Failed to load products. Please check if the server is running.';
        this.isLoading = false;
      }
    });
  }
}


