import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() productClick = new EventEmitter<Product>();

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onCardClick() {
    this.productClick.emit(this.product);
  }

  calculateDiscount(): number {
    if (this.product.price < 1500) {
      const originalPrice = this.product.price + 60;
      return Math.round(((originalPrice - this.product.price) / originalPrice) * 100);
    }
    return 0;
  }
}
