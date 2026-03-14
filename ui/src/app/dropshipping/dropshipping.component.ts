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

  // store current search text so template/CSS can keep the box expanded when it has content
  searchValue: string = '';

  // sort option state
  sortOption: string = 'default';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    // view child available after view init
  }

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
        console.log('Products received:', data);
        this.products = data;
        // apply sorting after setting products
        this.applySort();
        this.noResults = (data == null || data.length === 0);
        this.isLoading = false;
        // when loading all (no explicit search), clear searchValue so box can collapse
        this.searchValue = '';
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Failed to load products. Please check if the server is running.';
        this.isLoading = false;
        this.noResults = false;
      }
    });
  }

  onSearch(query: string) {
    const q = query?.trim() || '';
    // keep the current text so CSS can keep box expanded
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
        // apply sorting to search results
        this.applySort();
        this.noResults = (this.products.length === 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search failed:', err);
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
      case 'name-asc':
        copy.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
        break;
      case 'name-desc':
        copy.sort((a, b) => (b.productName || '').localeCompare(a.productName || ''));
        break;
      case 'price-asc':
        copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      default:
        // default: keep server order (or sort by id for stability)
        copy.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        break;
    }

    this.products = copy;
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
