export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  password?: string;
  phoneNumber?: number;
  defaultShippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  role?: string;
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
  phoneNumber?: number;
  defaultShippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}
