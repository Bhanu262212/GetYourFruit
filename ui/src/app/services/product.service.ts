import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Search products using the server's /search?q= endpoint
  searchProducts(q: string): Observable<Product[]> {
    const url = `${environment.apiUrl}/search?q=${encodeURIComponent(q)}`;
    return this.http.get<Product[]>(url);
  }

  getCart(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/cart/${userId}`);
  }

  updateCart(cartItem: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/cart`, cartItem);
  }

  addToCart(cartItem: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/cart`, cartItem);
  }

  deleteCartItem(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/${userId}/${productId}`);
  }

  clearCart(userId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/${userId}`);
  }
}
