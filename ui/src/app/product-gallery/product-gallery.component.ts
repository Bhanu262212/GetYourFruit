import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-gallery.component.html',
  styleUrls: ['./product-gallery.component.css']
})
export class ProductGalleryComponent implements OnInit, AfterViewInit {
  products: Product[] = [];

  @ViewChild('galleryContainer') galleryContainer!: ElementRef;
  @ViewChild('bgText') bgText!: ElementRef;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data;
      setTimeout(() => {
        this.initGsapAnimations();
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    // Animations initialize after data is loaded to ensure elements exist
  }

  initGsapAnimations() {
    if (typeof window === 'undefined') return;
    if (!this.galleryContainer || !this.bgText) return;

    const sections = gsap.utils.toArray('.product-card');

    if (sections.length > 0) {
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: this.galleryContainer.nativeElement,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + this.galleryContainer.nativeElement.offsetWidth
        }
      });
    }

    gsap.to(this.bgText.nativeElement, {
      xPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: this.galleryContainer.nativeElement,
        scrub: 1,
        start: 'top top',
        end: 'bottom bottom'
      }
    });
  }

  addToCart(product: Product) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Please login first");
      return;
    }

    const payload = {
      userId: userId,
      productId: product.id,
      quantity: 1,
      price: product.price
    };

    this.productService.addToCart(payload).subscribe({
      next: () => {
         // This is a simple implementation, later we can add the GSAP drop event
         window.dispatchEvent(new CustomEvent('cartUpdated'));
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
      }
    });
  }
}