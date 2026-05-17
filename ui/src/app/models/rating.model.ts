export interface Rating {
  id?: string;
  productId: string;
  userId: string;
  username?: string;
  feedbackMessage?: string;
  userRating: number;
  createdAt?: string;
}
