// =============================
// TIPOS GLOBAIS - BebeuJá
// =============================

export type UserRole = "customer" | "store" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Customer extends User {
  role: "customer";
  address?: string;
  neighborhood?: string;
}

export interface Store extends User {
  role: "store";
  storeName: string;
  description: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  neighborhood: string;
  city: string;
  isOpen: boolean;
  openingHours: string;
  closingHours: string;
  categories: string[];
  featured: boolean;
}

export interface Driver extends User {
  role: "driver";
  isOnline: boolean;
  vehicle: string;
  rating: number;
  completedDeliveries: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: ProductCategory;
  stock: number;
  featured: boolean;
  available: boolean;
  alcoholContent?: string;
  volume?: string;
}

export type ProductCategory =
  | "cerveja"
  | "whisky"
  | "vodka"
  | "vinho"
  | "energetico"
  | "gelo"
  | "combo"
  | "refrigerante"
  | "espumante"
  | "gin";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "aguardando"
  | "aceito"
  | "recusado"
  | "preparando"
  | "coletado"
  | "em_rota"
  | "entregue";

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  driverId?: string;
  driverName?: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: "pix";
  paymentStatus: "pending" | "paid";
  address: string;
  neighborhood: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  notes?: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
