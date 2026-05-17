import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  /** GET /ratings/product/{productId} — all reviews for a product (newest first). */
  getRatingsForProduct(productId: string): Observable<Rating[]> {
    return this.http
      .get<Rating[]>(`${this.apiUrl}/product/${productId}`)
      .pipe(catchError(() => of([] as Rating[])));
  }

  /** GET /ratings/product/{productId}/average — average user rating. */
  getAverageRating(productId: string): Observable<number> {
    return this.http
      .get<number>(`${this.apiUrl}/product/${productId}/average`)
      .pipe(catchError(() => of(0)));
  }

  /** POST /ratings — submit a new rating. */
  saveRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating);
  }
}
