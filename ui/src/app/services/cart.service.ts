import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.cartCount.next(0);
  }

  addToCart(product: Product): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId: product.id, quantity: 1 }).pipe(
      tap(() => {
        this.cartCount.next(this.cartCount.value + 1);
      })
    );
  }

  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  setCartCount(count: number): void {
    this.cartCount.next(count);
  }
}
