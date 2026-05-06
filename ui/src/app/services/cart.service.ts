import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { Product } from '../models/product';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Represents a raw cart item from the backend.
 * Backend entity: { id, productId, quantity, userId }
 */
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  userId: string;
}

/**
 * Enriched cart item with product details for display.
 */
export interface EnrichedCartItem extends CartItem {
  productName: string;
  price: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private productsUrl = `${environment.apiUrl}/products`;

  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartItemsSubject = new BehaviorSubject<EnrichedCartItem[]>([]);

  public cartCount$ = this.cartCountSubject.asObservable();
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load cart on startup if user is logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.refreshCart();
      } else {
        this.cartCountSubject.next(0);
        this.cartItemsSubject.next([]);
      }
    });
  }

  /** Get the logged-in user's ID */
  private getUserId(): string | null {
    const user = this.authService.currentUser;
    if (user && user.id) {
      return user.id;
    }
    // Fallback to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  /**
   * Add a product to cart.
   * Backend: POST /cart  body: { productId, quantity, userId }
   */
  addToCart(product: Product, quantity: number = 1): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return of(null);
    }

    const payload = {
      productId: product.id,
      quantity: quantity,
      userId: userId
    };

    return this.http.post(this.apiUrl, payload).pipe(
      tap(() => {
        // Refresh the full cart after adding
        this.refreshCart();
      }),
      catchError(err => {
        console.error('Error adding to cart', err);
        // If backend returns non-JSON (void), treat as success
        if (err.status === 200) {
          this.refreshCart();
          return of(null);
        }
        return of(null);
      })
    );
  }

  /**
   * Update cart item quantity.
   * Backend: PATCH /cart  body: { productId, quantity, userId }
   */
  updateCartItem(productId: string, quantity: number): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    const payload = { productId, quantity, userId };
    return this.http.patch(this.apiUrl, payload).pipe(
      tap(() => this.refreshCart()),
      catchError(err => {
        if (err.status === 200) {
          this.refreshCart();
          return of(null);
        }
        return of(null);
      })
    );
  }

  /**
   * Remove an item from cart.
   * Backend: DELETE /cart/{userId}/{productId}
   */
  removeFromCart(productId: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    return this.http.delete(`${this.apiUrl}/${userId}/${productId}`).pipe(
      tap(() => this.refreshCart()),
      catchError(err => {
        if (err.status === 200) {
          this.refreshCart();
          return of(null);
        }
        return of(null);
      })
    );
  }

  /**
   * Clear entire cart.
   * Backend: DELETE /cart/{userId}
   */
  clearCart(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return of(null);

    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      tap(() => {
        this.cartCountSubject.next(0);
        this.cartItemsSubject.next([]);
      }),
      catchError(err => {
        if (err.status === 200) {
          this.cartCountSubject.next(0);
          this.cartItemsSubject.next([]);
          return of(null);
        }
        return of(null);
      })
    );
  }

  /**
   * Fetch raw cart from backend and enrich with product details.
   * Backend: GET /cart/{userId} → Cart[] (id, productId, quantity, userId)
   * Then fetch all products to get names, prices, images.
   */
  refreshCart(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.cartCountSubject.next(0);
      this.cartItemsSubject.next([]);
      return;
    }

    // Fetch cart items and all products in parallel
    forkJoin({
      cartItems: this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`).pipe(
        catchError(() => of([] as CartItem[]))
      ),
      products: this.http.get<Product[]>(this.productsUrl).pipe(
        catchError(() => of([] as Product[]))
      )
    }).subscribe(({ cartItems, products }) => {
      // Build a product lookup map
      const productMap = new Map<string, Product>();
      products.forEach(p => productMap.set(p.id, p));

      // Enrich cart items with product details
      const enriched: EnrichedCartItem[] = cartItems.map(ci => {
        const product = productMap.get(ci.productId);
        return {
          ...ci,
          productName: product?.productName || `Product #${ci.productId}`,
          price: product?.price || 0,
          imageUrl: product?.imageUrl || 'assets/placeholder.png'
        };
      });

      this.cartItemsSubject.next(enriched);
      const totalQty = enriched.reduce((sum, item) => sum + item.quantity, 0);
      this.cartCountSubject.next(totalQty);
    });
  }

  /** Get cart count observable (legacy compatibility) */
  getCartCount(): Observable<number> {
    return this.cartCount$;
  }

  /** Set cart count manually (legacy compatibility) */
  setCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  /** Get enriched cart items observable */
  getCartItems(): Observable<EnrichedCartItem[]> {
    return this.cartItems$;
  }

  /** Get cart total price */
  getCartTotal(): number {
    const items = this.cartItemsSubject.value;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}
