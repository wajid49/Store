export type Category = 'kitchen' | 'home' | 'decor';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  quantity: number;
  stock: number;
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  _id: string;
  /** Admin lists include the customer; it can be null if the account was deleted. */
  user?: { _id: string; name: string; email: string } | string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod';
  itemsTotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface StoreSettings {
  currency: string;
  shippingFee: number;
  freeShippingOver: number;
}
