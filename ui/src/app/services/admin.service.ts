import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}

  /** Fetch all users */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/getAllUsers`);
  }

  /**
   * Update any subset of a user's fields. The backend (PUT /updateUser)
   * applies only the non-null properties on the request body, so this
   * single endpoint covers both "change role" and "edit profile" flows.
   */
  updateUser(user: Partial<User> & { id: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/updateUser`, user);
  }

  /** Convenience wrapper kept for callers that only want to change the role. */
  updateUserRole(user: { id: string; role: string }): Observable<User> {
    return this.updateUser(user);
  }

  /**
   * Save a product. The backend's POST /save delegates to MongoRepository.save(),
   * which is an upsert: payloads carrying an existing `id` update that record,
   * payloads without an `id` insert a new one. This single method therefore
   * covers both "create" and "update" flows.
   */
  saveProduct(product: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/save`, product);
  }

  /** Semantic alias used by the edit-product flow for readability. */
  updateProduct(product: Product): Observable<any> {
    return this.saveProduct(product);
  }
}
