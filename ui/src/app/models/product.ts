export interface Product {
  id: string;
  productName: string;
  price: number;
  imageUrl: string;
  stockStatus?: string;
  avgUserRating?: number;
  images?: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: { user: string; comment: string; rating: number }[];
}
