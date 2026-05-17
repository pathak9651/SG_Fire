/**
 * ============================================================
 * FILE: src/types/index.ts
 * PURPOSE: Central TypeScript type definitions for the entire
 *          SG Fire frontend application.
 *          Defines interfaces that mirror the backend MongoDB models.
 *          Import from this file for consistent typing everywhere.
 *
 * ORGANIZATION:
 *  - User & Auth types
 *  - Product & Category types
 *  - Cart types
 *  - Order types
 *  - Appointment types
 *  - Review types
 *  - API Response types
 *  - UI Component types
 * ============================================================
 */

// ─────────────────────────────────────────────
// USER & AUTH TYPES
// ─────────────────────────────────────────────

/** User address saved in profile */
export interface Address {
  _id: string;
  type: 'home' | 'office' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

/** Logged-in user profile */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'technician';
  avatar: { url: string; public_id: string };
  isVerified: boolean;
  isBlocked: boolean;
  addresses: Address[];
  wishlist: string[];      // Array of product IDs
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
}

/** Auth context state */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─────────────────────────────────────────────
// PRODUCT & CATEGORY TYPES
// ─────────────────────────────────────────────

/** Product category */
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: { url: string; public_id: string };
  parent?: string | null;
  order: number;
  isActive: boolean;
  icon?: string;
  productCount?: number;
}

/** Product image object */
export interface ProductImage {
  url: string;
  public_id: string;
  alt: string;
}

/** Product specification key-value */
export interface Specification {
  key: string;
  value: string;
}

/** Product review (embedded) */
export interface ProductReview {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  name: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string;
}

/** Full product object */
export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  category: Category | string;
  brand: string;
  tags: string[];
  price: number;
  discountPrice?: number;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  specifications: Specification[];
  ratings: number;
  numReviews: number;
  reviews: ProductReview[];
  isFeatured: boolean;
  isActive: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  totalSold: number;
  // Virtual fields from server
  discountPercentage: number;
  effectivePrice: number;
  inStock: boolean;
  isLowStock: boolean;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

// ─────────────────────────────────────────────
// CART TYPES
// ─────────────────────────────────────────────

/** Single item in the cart (with live prices from server) */
export interface CartItem {
  product: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  subtotal: number;
  stock: number;
  inStock: boolean;
}

/** Full cart with totals */
export interface Cart {
  validItems: CartItem[];
  itemsTotal: number;
  shippingCharge: number;
  taxAmount: number;
  totalAmount: number;
  appliedCoupon?: {
    code: string;
    discount: number;
  } | null;
}

/** Redux cart slice state */
export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────
// ORDER TYPES
// ─────────────────────────────────────────────

/** Order status options */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

/** Order item (snapshot at time of purchase) */
export interface OrderItem {
  product: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

/** Payment information */
export interface PaymentInfo {
  method: 'razorpay' | 'stripe' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

/** Full order object */
export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  itemsTotal: number;
  shippingCharge: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  coupon?: { code: string; discount: number };
  shippingAddress: Address;
  paymentInfo: PaymentInfo;
  orderStatus: OrderStatus;
  statusHistory: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  customerNotes?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// APPOINTMENT TYPES
// ─────────────────────────────────────────────

/** Service type options */
export type ServiceType =
  | 'installation'
  | 'inspection'
  | 'maintenance'
  | 'amc'
  | 'emergency'
  | 'consultation'
  | 'repair';

/** Appointment status options */
export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

/** Service address for appointment */
export interface ServiceAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  siteType: 'residential' | 'commercial' | 'industrial' | 'other';
}

/** Full appointment object */
export interface Appointment {
  _id: string;
  appointmentNumber: string;
  user: User | string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  serviceType: ServiceType;
  preferredDate: string;
  preferredTime: string;
  serviceAddress: ServiceAddress;
  notes?: string;
  siteImages: Array<{ url: string; public_id: string }>;
  status: AppointmentStatus;
  rejectionReason?: string;
  technician?: User | string | null;
  technicianNotes?: string;
  completedAt?: string;
  completionReport?: string;
  estimatedCost?: number;
  actualCost?: number;
  isEmergency: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────

/** Generic paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  totalProducts?: number;
  totalPages: number;
  currentPage: number;
}

/** Generic single-item API response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** API error response */
export interface ApiError {
  success: false;
  message: string;
}

// ─────────────────────────────────────────────
// FILTER TYPES (Product Listing Page)
// ─────────────────────────────────────────────

/** Product filter state */
export interface ProductFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  ratings?: number;
  sort?: 'price' | '-price' | '-createdAt' | '-totalSold' | '-ratings';
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// UI TYPES
// ─────────────────────────────────────────────

/** Toast notification variant */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

/** View mode for product listing */
export type ViewMode = 'grid' | 'list';
