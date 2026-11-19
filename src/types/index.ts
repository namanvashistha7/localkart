export type UserRole = 'customer' | 'retailer' | 'admin' | 'founder';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  locality: string;
  associatedStoreId?: string;
  photoURL?: string;
  isGoogleSignedIn?: boolean;
}

export interface Locality {
  id: string;
  name: string;
  pinCode: string;
  areaType: 'campus' | 'commercial' | 'residential';
  nearbyHighlights: string[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export interface Store {
  id: string;
  ownerUid?: string;
  name: string;
  ownerName: string;
  phone: string;
  locality: string;
  fullAddress: string;
  landmark: string;
  pincode: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
  status: 'active' | 'pending_approval' | 'suspended';
  verified: boolean;
  categories: string[];
  image: string;
  description: string;
  createdAt: string;
}

export type StockStatus = 'in_stock' | 'limited' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  mrp: number;
}

export interface StoreListing {
  id: string;
  storeId: string;
  productId: string;
  ownerUid?: string;
  price: number;
  stockStatus: StockStatus;
  updatedAt: string;
  notes?: string;
}

export type RequestStatus = 
  | 'submitted' 
  | 'accepted' 
  | 'ready_for_pickup' 
  | 'completed' 
  | 'cancelled';

export interface RequestItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image: string;
  unit: string;
}

export interface PurchaseRequest {
  id: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocality: string;
  storeId: string;
  storeOwnerUid?: string;
  storeName: string;
  items: RequestItem[];
  totalAmount: number;
  status: RequestStatus;
  pickupNotes?: string;
  preferredPickupTime?: string;
  retailerRemarks?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewText?: string;
}

export interface StoreReview {
  id: string;
  storeId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UnitEconomicsScenario {
  id: 'conservative' | 'base' | 'ambitious';
  name: string;
  customersPerMonth: number;
  purchasesPerCustomer: number;
  variableCostPerTxn: number;
  fixedCostsPerMonth: number;
  commissionRate: number; // e.g. 0.10
  avgOrderValue: number;  // e.g. 600
}

export interface ValidationMilestone {
  week: number;
  title: string;
  targetDescription: string;
  targetMetric: string;
  targetValue: number;
  actualValue: number;
  metricLabel: string;
  notes: string;
  status: 'pending' | 'in_progress' | 'achieved' | 'needs_pivot';
}

export interface CoreAssumption {
  id: string;
  title: string;
  hypothesis: string;
  metricToTrack: string;
  status: 'assumption' | 'observing' | 'validated';
  evidenceNotes: string;
  keyLearnings: string;
}
