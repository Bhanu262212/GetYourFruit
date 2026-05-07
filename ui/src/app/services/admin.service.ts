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

  /** Update a user's role */
  updateUserRole(user: { id: string; role: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/updateUser`, user);
  }

  /** Save a new product */
  saveProduct(product: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/save`, product);
  }
}
