import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import gsap from 'gsap';

@Component({
  selector: 'app-cart-crate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-crate.component.html',
  styleUrls: ['./cart-crate.component.css']
})
export class CartCrateComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  isOpen = false;
  total = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCart();
    // Listen for custom event from gallery
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', this.handleCartUpdate);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('cartUpdated', this.handleCartUpdate);
    }
  }

  handleCartUpdate = () => {
    this.loadCart();
    this.animateDrop();
  }

  loadCart() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.productService.getCart(userId).subscribe((items) => {
          this.cartItems = items;
          this.calculateTotal();
        });
      }
    }
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  toggleCrate() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        gsap.fromTo('.crate-modal',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }, 0);
    }
  }

  animateDrop() {
    // Simple drop animation on the floating icon
    gsap.fromTo('.floating-basket',
      { y: -20, scale: 1.2 },
      { y: 0, scale: 1, duration: 0.5, ease: 'bounce.out' }
    );
  }

  removeItem(productId: string) {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.productService.deleteCartItem(userId, productId).subscribe(() => {
        this.loadCart();
      });
    }
  }
}