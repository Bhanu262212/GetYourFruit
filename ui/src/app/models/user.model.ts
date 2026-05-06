export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  defaultShippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  defaultShippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}
