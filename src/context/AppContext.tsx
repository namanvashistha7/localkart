import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  sanitizeId,
  isFirestoreMarketplaceSeeded,
  seedFirestoreMarketplace,
} from '../services/firestoreSync';
import {
  User,
  UserRole,
  Store,
  Product,
  StoreListing,
  PurchaseRequest,
  Locality,
  Category,
  UnitEconomicsScenario,
  ValidationMilestone,
  CoreAssumption,
  RequestStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_LOCALITIES,
  INITIAL_CATEGORIES,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_LISTINGS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_SCENARIOS,
  INITIAL_VALIDATION_MILESTONES,
  INITIAL_CORE_ASSUMPTIONS,
} from '../data/mockData';

interface AppContextType {
  // Firebase Google Auth
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  updateMyGoogleProfile: (updates: {
    name?: string;
    phone?: string;
    locality?: string;
    role?: 'customer' | 'retailer';
  }) => Promise<void>;

  currentUser: User;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  selectedLocality: string;
  setSelectedLocality: (locality: string) => void;
  
  // Navigation
  currentView: string;
  viewParam: any;
  navigateTo: (view: string, param?: any) => void;
  
  // Data
  stores: Store[];
  products: Product[];
  storeListings: StoreListing[];
  purchaseRequests: PurchaseRequest[];
  localities: Locality[];
  categories: Category[];
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  
  // Customer Actions
  savedStoreIds: string[];
  savedProductIds: string[];
  toggleSaveStore: (storeId: string) => void;
  toggleSaveProduct: (productId: string) => void;
  submitPurchaseRequest: (data: {
    storeId: string;
    storeName: string;
    items: PurchaseRequest['items'];
    totalAmount: number;
    pickupNotes?: string;
    preferredPickupTime?: string;
  }) => string;
  submitRequestFeedback: (requestId: string, rating: number, feedback: string) => void;
  
  // Retailer Actions
  currentRetailerStore: Store | undefined;
  updateStoreListing: (listingId: string, updates: Partial<StoreListing>) => void;
  addStoreListing: (storeId: string, productId: string, price: number, stockStatus: StoreListing['stockStatus'], notes?: string) => void;
  updateStoreProfile: (storeId: string, updates: Partial<Store>) => void;
  addNewProductAndList: (productData: Omit<Product, 'id'>, storeId: string, price: number, stockStatus: StoreListing['stockStatus']) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, remarks?: string) => void;
  registerNewStore: (storeData: Partial<Store>) => string;
  
  // Admin Actions
  approveStore: (storeId: string) => void;
  rejectStore: (storeId: string) => void;
  toggleStoreStatus: (storeId: string, status: 'active' | 'suspended') => void;
  
  // Founder / Venture Quest Actions
  scenarios: Record<string, UnitEconomicsScenario>;
  activeScenarioId: 'conservative' | 'base' | 'ambitious';
  setActiveScenarioId: (id: 'conservative' | 'base' | 'ambitious') => void;
  updateScenario: (id: string, updates: Partial<UnitEconomicsScenario>) => void;
  validationMilestones: ValidationMilestone[];
  updateValidationMilestone: (week: number, actualValue: number, notes: string, status: ValidationMilestone['status']) => void;
  coreAssumptions: CoreAssumption[];
  updateCoreAssumption: (id: string, updates: Partial<CoreAssumption>) => void;
  
  // Firestore Database Sync & Seeding
  isMarketplaceSeeded: boolean;
  seedingDatabase: boolean;
  isStoreInFirestore: (storeId: string) => boolean;
  seedDatabaseNow: () => Promise<void>;
  submitStoreReview: (storeId: string, rating: number, comment: string) => Promise<void>;
  submitSupportFeedback: (
    category: 'customer' | 'retailer' | 'general',
    name: string,
    contact: string,
    message: string
  ) => Promise<void>;

  // Reset
  resetToDefaultData: () => void;
}

const ADMIN_EMAIL = 'namanbhattarai7@gmail.com';

function formatFirestoreDate(val: unknown, fallback?: string): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString().replace('T', ' ').slice(0, 16);
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  return fallback || new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function mapFirestoreRequestDoc(
  docId: string,
  r: Record<string, unknown>,
  fallbackCustomerId: string
): PurchaseRequest {
  const createdStr = formatFirestoreDate(r.createdAt);
  const updatedStr = formatFirestoreDate(r.updatedAt, createdStr);
  return {
    id: docId,
    referenceNumber: String(r.referenceNumber || ''),
    customerId: String(r.customerId || fallbackCustomerId),
    customerName: String(r.customerName || ''),
    customerPhone: String(r.customerPhone || ''),
    customerLocality: String(r.customerLocality || 'Dehradun'),
    storeId: String(r.storeId || ''),
    storeOwnerUid: typeof r.storeOwnerUid === 'string' ? r.storeOwnerUid : undefined,
    storeName: String(r.storeName || ''),
    items: [
      {
        productId: 'summary',
        productName: String(r.itemSummary || 'Store Pickup Items'),
        quantity: 1,
        unitPrice: Number(r.totalAmount || 0),
        total: Number(r.totalAmount || 0),
        image:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        unit: 'Order',
      },
    ],
    totalAmount: Number(r.totalAmount || 0),
    status: (r.status as RequestStatus) || 'submitted',
    pickupNotes: typeof r.pickupNotes === 'string' ? r.pickupNotes : undefined,
    preferredPickupTime:
      typeof r.preferredPickupTime === 'string' ? r.preferredPickupTime : undefined,
    retailerRemarks:
      typeof r.retailerRemarks === 'string' ? r.retailerRemarks : undefined,
    rating: typeof r.rating === 'number' ? r.rating : undefined,
    reviewText: typeof r.reviewText === 'string' ? r.reviewText : undefined,
    createdAt: createdStr,
    updatedAt: updatedStr,
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'localkart_ddn_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMarketplaceSeeded, setIsMarketplaceSeeded] = useState<boolean>(false);
  const [seedingDatabase, setSeedingDatabase] = useState<boolean>(false);
  const [firestoreStoreIds, setFirestoreStoreIds] = useState<Set<string>>(new Set());
  const [firestoreProductIds, setFirestoreProductIds] = useState<Set<string>>(new Set());
  const [firestoreListingIds, setFirestoreListingIds] = useState<Set<string>>(new Set());
  const [firestoreUserRequests, setFirestoreUserRequests] = useState<PurchaseRequest[]>([]);
  const [firestoreMarketplaceRequests, setFirestoreMarketplaceRequests] = useState<PurchaseRequest[]>([]);
  const autoSeedAttemptedRef = useRef<boolean>(false);

  // Load initial from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [selectedLocality, setSelectedLocality] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}locality`) || 'All';
  });

  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParam, setViewParam] = useState<any>(null);

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stores`);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [storeListings, setStoreListings] = useState<StoreListing[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}listings`);
    return saved ? JSON.parse(saved) : INITIAL_STORE_LISTINGS;
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}requests`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_REQUESTS;
  });

  const [savedStoreIds, setSavedStoreIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}saved_stores`);
    return saved ? JSON.parse(saved) : ['store_gupta_kirana', 'store_doon_book_world'];
  });

  const [savedProductIds, setSavedProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}saved_prods`);
    return saved ? JSON.parse(saved) : ['prod_classmate_spiral', 'prod_maggi_multipack'];
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}searches`);
    return saved ? JSON.parse(saved) : ['Classmate notebook', 'Maggi', 'Dove shampoo', 'A4 paper'];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Venture Quest State
  const [scenarios, setScenarios] = useState<Record<string, UnitEconomicsScenario>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}scenarios`);
    return saved ? JSON.parse(saved) : INITIAL_SCENARIOS;
  });

  const [activeScenarioId, setActiveScenarioId] = useState<'conservative' | 'base' | 'ambitious'>('base');

  const [validationMilestones, setValidationMilestones] = useState<ValidationMilestone[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}milestones`);
    return saved ? JSON.parse(saved) : INITIAL_VALIDATION_MILESTONES;
  });

  const [coreAssumptions, setCoreAssumptions] = useState<CoreAssumption[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}assumptions`);
    return saved ? JSON.parse(saved) : INITIAL_CORE_ASSUMPTIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}locality`, selectedLocality);
  }, [selectedLocality]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stores`, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}listings`, JSON.stringify(storeListings));
  }, [storeListings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}saved_stores`, JSON.stringify(savedStoreIds));
  }, [savedStoreIds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}saved_prods`, JSON.stringify(savedProductIds));
  }, [savedProductIds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}searches`, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}scenarios`, JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}milestones`, JSON.stringify(validationMilestones));
  }, [validationMilestones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}assumptions`, JSON.stringify(coreAssumptions));
  }, [coreAssumptions]);

  // Firebase Auth Listener & Firestore User Sync
  useEffect(() => {
    let unsubRequests: (() => void) | undefined;
    let unsubSaved: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (unsubRequests) {
        unsubRequests();
        unsubRequests = undefined;
      }
      if (unsubSaved) {
        unsubSaved();
        unsubSaved = undefined;
      }

      if (!fbUser) {
        setFirestoreUserRequests([]);
        setFirestoreMarketplaceRequests([]);
        setIsAuthReady(true);
        return;
      }

      const userPath = `users/${fbUser.uid}`;
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);

        let profileData: User;
        if (snap.exists()) {
          const data = snap.data();
          profileData = {
            id: fbUser.uid,
            name: String(data.name || fbUser.displayName || 'LocalKart User').slice(0, 100),
            email: String(data.email || fbUser.email || '').slice(0, 200),
            phone: typeof data.phone === 'string' ? data.phone : '',
            role: data.role === 'retailer' ? 'retailer' : 'customer',
            locality: String(data.locality || 'Karanpur').slice(0, 80),
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : fbUser.photoURL || undefined,
            associatedStoreId: typeof data.associatedStoreId === 'string' ? data.associatedStoreId : undefined,
            isGoogleSignedIn: true,
          };
        } else {
          const defaultName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'LocalKart User').slice(0, 100);
          const defaultLocality = (selectedLocality !== 'All' ? selectedLocality : 'Karanpur').slice(0, 80);
          const newDocPayload: Record<string, unknown> = {
            uid: fbUser.uid,
            name: defaultName,
            email: (fbUser.email || '').slice(0, 200),
            locality: defaultLocality,
            role: 'customer',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (fbUser.photoURL) {
            newDocPayload.photoURL = fbUser.photoURL.slice(0, 500);
          }

          await setDoc(userRef, newDocPayload);
          profileData = {
            id: fbUser.uid,
            name: defaultName,
            email: fbUser.email || '',
            phone: '',
            role: 'customer',
            locality: defaultLocality,
            photoURL: fbUser.photoURL || undefined,
            isGoogleSignedIn: true,
          };
        }

        setCurrentUser(profileData);
        if (profileData.locality && profileData.locality !== 'All') {
          setSelectedLocality(profileData.locality);
        }

        // Subscribe to user's private fallback purchase requests
        const reqPath = `users/${fbUser.uid}/requests`;
        const reqQuery = query(
          collection(db, 'users', fbUser.uid, 'requests'),
          where('customerId', '==', fbUser.uid)
        );
        unsubRequests = onSnapshot(
          reqQuery,
          (snapshot) => {
            const loaded = snapshot.docs.map((d) =>
              mapFirestoreRequestDoc(d.id, d.data() as Record<string, unknown>, fbUser.uid)
            );
            setFirestoreUserRequests(loaded);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, reqPath);
          }
        );

        // Subscribe to user's Firestore saved bookmarks
        const savedPath = `users/${fbUser.uid}/saved`;
        const savedQuery = query(
          collection(db, 'users', fbUser.uid, 'saved'),
          where('userId', '==', fbUser.uid)
        );
        unsubSaved = onSnapshot(
          savedQuery,
          (snapshot) => {
            const storeBookmarks: string[] = [];
            const prodBookmarks: string[] = [];
            snapshot.docs.forEach((d) => {
              const item = d.data();
              if (item.targetType === 'store' && typeof item.targetId === 'string') {
                storeBookmarks.push(item.targetId);
              } else if (item.targetType === 'product' && typeof item.targetId === 'string') {
                prodBookmarks.push(item.targetId);
              }
            });
            setSavedStoreIds(storeBookmarks);
            setSavedProductIds(prodBookmarks);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, savedPath);
          }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, userPath);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubRequests) unsubRequests();
      if (unsubSaved) unsubSaved();
    };
  }, []);

  // Firestore Marketplace & Venture Sync Listeners
  useEffect(() => {
    if (!isAuthReady) return;

    const isVerifiedAdmin = Boolean(
      firebaseUser && firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified
    );

    const mapStoreDoc = (docId: string, d: Record<string, unknown>): Store => ({
      id: docId,
      ownerUid: typeof d.ownerUid === 'string' ? d.ownerUid : undefined,
      name: String(d.name || 'Local Store'),
      ownerName: String(d.ownerName || 'Owner'),
      phone: String(d.phone || '+91 98000 00000'),
      locality: String(d.locality || 'Dehradun'),
      fullAddress: String(d.fullAddress || ''),
      landmark: String(d.landmark || ''),
      pincode: String(d.pincode || '248001'),
      rating: Number(d.rating ?? 5.0),
      reviewCount: Number(d.reviewCount ?? 0),
      openingHours: String(d.openingHours || '09:00 AM - 09:00 PM'),
      status: (d.status as Store['status']) || 'active',
      verified: Boolean(d.verified),
      categories: Array.isArray(d.categories) ? d.categories.map(String) : ['groceries'],
      image:
        typeof d.image === 'string' && d.image
          ? d.image
          : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      description: String(d.description || ''),
      createdAt: formatFirestoreDate(d.createdAt).slice(0, 10),
    });

    const unsubscribers: Array<() => void> = [];

    // 1. Stores Sync
    let activeStoresMap = new Map<string, Store>();
    let ownedStoresMap = new Map<string, Store>();

    const commitMergedStores = () => {
      const merged = new Map<string, Store>();
      activeStoresMap.forEach((v, k) => merged.set(k, v));
      ownedStoresMap.forEach((v, k) => merged.set(k, v));
      if (merged.size > 0) {
        setStores(Array.from(merged.values()));
        setFirestoreStoreIds(new Set(merged.keys()));
        setIsMarketplaceSeeded(true);
      } else {
        setFirestoreStoreIds(new Set());
        setIsMarketplaceSeeded(false);
      }
    };

    if (isVerifiedAdmin) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'stores'),
          (snap) => {
            const nextMap = new Map<string, Store>();
            snap.docs.forEach((docSnap) => {
              nextMap.set(docSnap.id, mapStoreDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
            });
            activeStoresMap = nextMap;
            ownedStoresMap = new Map();
            commitMergedStores();
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'stores');
          }
        )
      );
    } else {
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'stores'), where('status', '==', 'active')),
          (snap) => {
            const nextMap = new Map<string, Store>();
            snap.docs.forEach((docSnap) => {
              nextMap.set(docSnap.id, mapStoreDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
            });
            activeStoresMap = nextMap;
            commitMergedStores();
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'stores');
          }
        )
      );

      if (firebaseUser && firebaseUser.emailVerified) {
        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'stores'), where('ownerUid', '==', firebaseUser.uid)),
            (snap) => {
              const nextMap = new Map<string, Store>();
              snap.docs.forEach((docSnap) => {
                nextMap.set(docSnap.id, mapStoreDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
              });
              ownedStoresMap = nextMap;
              commitMergedStores();
            },
            (error) => {
              handleFirestoreError(error, OperationType.LIST, 'stores');
            }
          )
        );
      }
    }

    // 2. Products Sync
    unsubscribers.push(
      onSnapshot(
        query(
          collection(db, 'products'),
          where('category', 'in', [
            'groceries',
            'stationery',
            'personal_care',
            'household',
            'electronics',
            'other',
          ])
        ),
        (snap) => {
          if (!snap.empty) {
            const loadedProducts: Product[] = snap.docs
              .map((docSnap) => {
                const d = docSnap.data();
                return {
                  id: docSnap.id,
                  name: String(d.name || ''),
                  brand: String(d.brand || ''),
                  category: String(d.category || 'other'),
                  description: String(d.description || ''),
                  image:
                    typeof d.image === 'string' && d.image
                      ? d.image
                      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
                  unit: String(d.unit || '1 Unit'),
                  mrp: Number(d.mrp || 0),
                };
              })
              .sort((a, b) => a.name.localeCompare(b.name));
            setProducts(loadedProducts);
            setFirestoreProductIds(new Set(loadedProducts.map((p) => p.id)));
          } else {
            setFirestoreProductIds(new Set());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'products');
        }
      )
    );

    // 3. Store Listings Sync
    unsubscribers.push(
      onSnapshot(
        query(
          collection(db, 'listings'),
          where('stockStatus', 'in', ['in_stock', 'limited', 'out_of_stock'])
        ),
        (snap) => {
          if (!snap.empty) {
            const loadedListings: StoreListing[] = snap.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                storeId: String(d.storeId || ''),
                productId: String(d.productId || ''),
                ownerUid: typeof d.ownerUid === 'string' ? d.ownerUid : undefined,
                price: Number(d.price || 0),
                stockStatus: (d.stockStatus as StoreListing['stockStatus']) || 'in_stock',
                notes: typeof d.notes === 'string' ? d.notes : undefined,
                updatedAt: formatFirestoreDate(d.updatedAt).slice(0, 10),
              };
            });
            setStoreListings(loadedListings);
            setFirestoreListingIds(new Set(loadedListings.map((l) => l.id)));
          } else {
            setFirestoreListingIds(new Set());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'listings');
        }
      )
    );

    // 4. Shared Marketplace Purchase Requests Sync (authenticated verified users)
    if (firebaseUser && firebaseUser.emailVerified) {
      if (isVerifiedAdmin) {
        unsubscribers.push(
          onSnapshot(
            collection(db, 'purchaseRequests'),
            (snap) => {
              const loaded = snap.docs.map((docSnap) =>
                mapFirestoreRequestDoc(
                  docSnap.id,
                  docSnap.data() as Record<string, unknown>,
                  firebaseUser.uid
                )
              );
              setFirestoreMarketplaceRequests(loaded);
            },
            (error) => {
              handleFirestoreError(error, OperationType.LIST, 'purchaseRequests');
            }
          )
        );
      } else {
        let customerMap = new Map<string, PurchaseRequest>();
        let storeOwnerMap = new Map<string, PurchaseRequest>();
        const commitMergedRequests = () => {
          const merged = new Map<string, PurchaseRequest>();
          customerMap.forEach((v, k) => merged.set(k, v));
          storeOwnerMap.forEach((v, k) => merged.set(k, v));
          setFirestoreMarketplaceRequests(Array.from(merged.values()));
        };

        unsubscribers.push(
          onSnapshot(
            query(
              collection(db, 'purchaseRequests'),
              where('customerId', '==', firebaseUser.uid)
            ),
            (snap) => {
              const nextMap = new Map<string, PurchaseRequest>();
              snap.docs.forEach((docSnap) => {
                nextMap.set(
                  docSnap.id,
                  mapFirestoreRequestDoc(
                    docSnap.id,
                    docSnap.data() as Record<string, unknown>,
                    firebaseUser.uid
                  )
                );
              });
              customerMap = nextMap;
              commitMergedRequests();
            },
            (error) => {
              handleFirestoreError(error, OperationType.LIST, 'purchaseRequests');
            }
          )
        );

        unsubscribers.push(
          onSnapshot(
            query(
              collection(db, 'purchaseRequests'),
              where('storeOwnerUid', '==', firebaseUser.uid)
            ),
            (snap) => {
              const nextMap = new Map<string, PurchaseRequest>();
              snap.docs.forEach((docSnap) => {
                nextMap.set(
                  docSnap.id,
                  mapFirestoreRequestDoc(
                    docSnap.id,
                    docSnap.data() as Record<string, unknown>,
                    firebaseUser.uid
                  )
                );
              });
              storeOwnerMap = nextMap;
              commitMergedRequests();
            },
            (error) => {
              handleFirestoreError(error, OperationType.LIST, 'purchaseRequests');
            }
          )
        );
      }
    }

    // 5. Venture Quest Config Sync (Admin/Founder only)
    if (isVerifiedAdmin) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'ventureData'),
          (snap) => {
            snap.docs.forEach((docSnap) => {
              const data = docSnap.data();
              const payload = data.payload as { items?: unknown } | undefined;
              if (!payload || !payload.items) return;
              if (docSnap.id === 'scenarios' && typeof payload.items === 'object' && !Array.isArray(payload.items)) {
                setScenarios(payload.items as Record<string, UnitEconomicsScenario>);
              } else if (docSnap.id === 'milestones' && Array.isArray(payload.items)) {
                setValidationMilestones(payload.items as ValidationMilestone[]);
              } else if (docSnap.id === 'assumptions' && Array.isArray(payload.items)) {
                setCoreAssumptions(payload.items as CoreAssumption[]);
              }
            });
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'ventureData');
          }
        )
      );

      // Auto-seed demo marketplace on admin sign-in if Firestore is empty
      if (firebaseUser && !autoSeedAttemptedRef.current) {
        autoSeedAttemptedRef.current = true;
        const adminUid = firebaseUser.uid;
        isFirestoreMarketplaceSeeded()
          .then(async (seeded) => {
            if (!seeded) {
              setSeedingDatabase(true);
              try {
                await seedFirestoreMarketplace(adminUid);
                setIsMarketplaceSeeded(true);
              } finally {
                setSeedingDatabase(false);
              }
            }
          })
          .catch(() => {
            // Errors are surfaced via handleFirestoreError inside helper
          });
      }
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isAuthReady, firebaseUser]);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in popup was closed before completing login. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Browser blocked the Google sign-in popup. Please allow popups for this site.');
      } else {
        setAuthError(error instanceof Error ? error.message : 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutGoogle = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(INITIAL_USERS[0]);
      setSavedStoreIds(['store_gupta_kirana', 'store_doon_book_world']);
      setSavedProductIds(['prod_classmate_spiral', 'prod_maggi_multipack']);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to sign out.');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateMyGoogleProfile = async (updates: {
    name?: string;
    phone?: string;
    locality?: string;
    role?: 'customer' | 'retailer';
  }) => {
    if (!firebaseUser) return;
    const userPath = `users/${firebaseUser.uid}`;
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) payload.name = updates.name.trim().slice(0, 100);
    if (updates.phone !== undefined) payload.phone = updates.phone.trim().slice(0, 30);
    if (updates.locality !== undefined) payload.locality = updates.locality.trim().slice(0, 80);
    if (updates.role !== undefined) payload.role = updates.role;

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), payload);
      setCurrentUser((prev) => ({
        ...prev,
        name: updates.name !== undefined ? updates.name.trim().slice(0, 100) : prev.name,
        phone: updates.phone !== undefined ? updates.phone.trim().slice(0, 30) : prev.phone,
        locality: updates.locality !== undefined ? updates.locality.trim().slice(0, 80) : prev.locality,
        role: updates.role !== undefined ? updates.role : prev.role,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  };

  const navigateTo = (view: string, param: any = null) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = INITIAL_USERS.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser((prev) =>
        firebaseUser
          ? {
              ...prev,
              role,
              associatedStoreId: prev.associatedStoreId || matchingUser.associatedStoreId,
            }
          : matchingUser
      );
      if (role === 'customer') {
        navigateTo('customer_dashboard');
      } else if (role === 'retailer') {
        navigateTo('retailer_dashboard');
      } else if (role === 'admin') {
        navigateTo('admin_dashboard');
      } else if (role === 'founder') {
        navigateTo('founder_workspace');
      }
    }
  };

  const currentRetailerStore = stores.find(
    s => s.id === (currentUser.associatedStoreId || 'store_gupta_kirana')
  );

  const addRecentSearch = (queryText: string) => {
    if (!queryText.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== queryText.toLowerCase());
      return [queryText.trim(), ...filtered].slice(0, 8);
    });
  };

  const toggleSaveStore = (storeId: string) => {
    const currentlySaved = savedStoreIds.includes(storeId);
    setSavedStoreIds(prev =>
      currentlySaved ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
    if (firebaseUser) {
      const docId = `store_${storeId}`.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
      const docPath = `users/${firebaseUser.uid}/saved/${docId}`;
      const docRef = doc(db, 'users', firebaseUser.uid, 'saved', docId);
      if (currentlySaved) {
        deleteDoc(docRef).catch((err) => handleFirestoreError(err, OperationType.DELETE, docPath));
      } else {
        setDoc(docRef, {
          userId: firebaseUser.uid,
          targetId: storeId.slice(0, 128),
          targetType: 'store',
          createdAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.CREATE, docPath));
      }
    }
  };

  const toggleSaveProduct = (productId: string) => {
    const currentlySaved = savedProductIds.includes(productId);
    setSavedProductIds(prev =>
      currentlySaved ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    if (firebaseUser) {
      const docId = `product_${productId}`.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
      const docPath = `users/${firebaseUser.uid}/saved/${docId}`;
      const docRef = doc(db, 'users', firebaseUser.uid, 'saved', docId);
      if (currentlySaved) {
        deleteDoc(docRef).catch((err) => handleFirestoreError(err, OperationType.DELETE, docPath));
      } else {
        setDoc(docRef, {
          userId: firebaseUser.uid,
          targetId: productId.slice(0, 128),
          targetType: 'product',
          createdAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.CREATE, docPath));
      }
    }
  };

  const seedDatabaseNow = async () => {
    if (!firebaseUser || firebaseUser.email !== ADMIN_EMAIL || !firebaseUser.emailVerified) {
      return;
    }
    setSeedingDatabase(true);
    try {
      await seedFirestoreMarketplace(firebaseUser.uid);
      setIsMarketplaceSeeded(true);
    } finally {
      setSeedingDatabase(false);
    }
  };

  const isStoreInFirestore = (storeId: string) => firestoreStoreIds.has(sanitizeId(storeId));

  const submitStoreReview = async (storeId: string, rating: number, comment: string) => {
    const safeStoreId = sanitizeId(storeId);
    const trimmedComment = comment.trim().slice(0, 500);
    if (!trimmedComment) return;

    if (firebaseUser && firebaseUser.emailVerified && firestoreStoreIds.has(safeStoreId)) {
      const reviewId = sanitizeId(`rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const reviewPath = `stores/${safeStoreId}/reviews/${reviewId}`;
      try {
        await setDoc(doc(db, 'stores', safeStoreId, 'reviews', reviewId), {
          storeId: safeStoreId,
          authorUid: firebaseUser.uid,
          customerName: (currentUser.name || firebaseUser.displayName || 'Customer').slice(0, 100),
          rating: Math.min(5, Math.max(1, Number(rating))),
          comment: trimmedComment,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, reviewPath);
      }
    }
  };

  const submitSupportFeedback = async (
    category: 'customer' | 'retailer' | 'general',
    name: string,
    contact: string,
    message: string
  ) => {
    const trimmedName = name.trim().slice(0, 100);
    const rawContact = contact.trim();
    const safeContact = (rawContact.length >= 3 ? rawContact : (firebaseUser?.email || 'contact@localkart')).slice(0, 120);
    const trimmedMsg = message.trim().slice(0, 1000);
    if (!trimmedName || !trimmedMsg) return;

    if (firebaseUser && firebaseUser.emailVerified) {
      const fbId = sanitizeId(`fb_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      const fbPath = `feedback/${fbId}`;
      try {
        await setDoc(doc(db, 'feedback', fbId), {
          authorUid: firebaseUser.uid,
          category,
          name: trimmedName,
          contact: safeContact,
          message: trimmedMsg,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, fbPath);
      }
    }
  };

  const submitPurchaseRequest = (data: {
    storeId: string;
    storeName: string;
    items: PurchaseRequest['items'];
    totalAmount: number;
    pickupNotes?: string;
    preferredPickupTime?: string;
  }): string => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const refNum = `LK-DDN-${new Date().getFullYear()}-${randomSeq}`;
    const reqId = sanitizeId(`req_${Date.now()}`);
    const safeStoreId = sanitizeId(data.storeId);
    const customerLocality =
      selectedLocality === 'All' ? (currentUser.locality || 'Dehradun') : selectedLocality;
    const rawPhone = currentUser.phone || '';
    const customerPhone =
      rawPhone.replace(/\D/g, '').length >= 10 && rawPhone.trim().length >= 10
        ? rawPhone.trim()
        : '+91 98765 00000';

    const newReq: PurchaseRequest = {
      id: reqId,
      referenceNumber: refNum,
      customerId: firebaseUser ? firebaseUser.uid : currentUser.id,
      customerName: currentUser.name,
      customerPhone,
      customerLocality,
      storeId: safeStoreId,
      storeName: data.storeName,
      items: data.items,
      totalAmount: data.totalAmount,
      status: 'submitted',
      pickupNotes: data.pickupNotes,
      preferredPickupTime: data.preferredPickupTime || 'Today, Within 2 Hours',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    if (firebaseUser && firebaseUser.emailVerified) {
      const summary = data.items
        .map((i) => `${i.productName} (x${i.quantity})`)
        .join(', ')
        .slice(0, 500) || 'Store Order';

      const targetStore = stores.find((s) => s.id === safeStoreId);
      const isSeededStore = firestoreStoreIds.has(safeStoreId) && Boolean(targetStore?.ownerUid);

      if (isSeededStore && targetStore?.ownerUid) {
        const reqPath = `purchaseRequests/${reqId}`;
        const marketplacePayload: Record<string, unknown> = {
          id: reqId,
          referenceNumber: refNum.slice(0, 40),
          customerId: firebaseUser.uid,
          customerName: (currentUser.name || 'Customer').slice(0, 100),
          customerPhone: customerPhone.slice(0, 30),
          customerLocality: customerLocality.slice(0, 80),
          storeId: safeStoreId,
          storeOwnerUid: sanitizeId(targetStore.ownerUid),
          storeName: data.storeName.slice(0, 120),
          itemSummary: summary,
          totalAmount: Number(data.totalAmount),
          status: 'submitted',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (data.pickupNotes && data.pickupNotes.trim()) {
          marketplacePayload.pickupNotes = data.pickupNotes.trim().slice(0, 300);
        }
        if (data.preferredPickupTime && data.preferredPickupTime.trim()) {
          marketplacePayload.preferredPickupTime = data.preferredPickupTime.trim().slice(0, 80);
        }

        setDoc(doc(db, 'purchaseRequests', reqId), marketplacePayload).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, reqPath)
        );
      } else {
        const reqPath = `users/${firebaseUser.uid}/requests/${reqId}`;
        const userPayload: Record<string, unknown> = {
          referenceNumber: refNum.slice(0, 40),
          customerId: firebaseUser.uid,
          customerName: (currentUser.name || 'Customer').slice(0, 100),
          customerPhone: customerPhone.slice(0, 30),
          customerLocality: customerLocality.slice(0, 80),
          storeId: safeStoreId,
          storeName: data.storeName.slice(0, 120),
          totalAmount: Number(data.totalAmount),
          status: 'submitted',
          itemSummary: summary,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (data.pickupNotes && data.pickupNotes.trim()) {
          userPayload.pickupNotes = data.pickupNotes.trim().slice(0, 300);
        }
        if (data.preferredPickupTime && data.preferredPickupTime.trim()) {
          userPayload.preferredPickupTime = data.preferredPickupTime.trim().slice(0, 80);
        }

        setDoc(doc(db, 'users', firebaseUser.uid, 'requests', reqId), userPayload).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, reqPath)
        );
      }
    } else {
      setPurchaseRequests(prev => [newReq, ...prev]);
    }

    return newReq.referenceNumber;
  };

  const submitRequestFeedback = (requestId: string, rating: number, feedback: string) => {
    const safeRating = Math.min(5, Math.max(1, Number(rating)));
    const safeFeedback = feedback.trim().slice(0, 500);
    setPurchaseRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, rating: safeRating, reviewText: safeFeedback } : r))
    );

    if (firebaseUser && firebaseUser.emailVerified) {
      if (firestoreMarketplaceRequests.some((r) => r.id === requestId)) {
        const reqPath = `purchaseRequests/${requestId}`;
        updateDoc(doc(db, 'purchaseRequests', requestId), {
          rating: safeRating,
          reviewText: safeFeedback,
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, reqPath));
      } else if (firestoreUserRequests.some((r) => r.id === requestId)) {
        const reqPath = `users/${firebaseUser.uid}/requests/${requestId}`;
        updateDoc(doc(db, 'users', firebaseUser.uid, 'requests', requestId), {
          rating: safeRating,
          reviewText: safeFeedback,
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, reqPath));
      }
    }
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus, remarks?: string) => {
    setPurchaseRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status,
              retailerRemarks: remarks || r.retailerRemarks,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : r
      )
    );

    if (firebaseUser && firebaseUser.emailVerified) {
      const marketplaceReq = firestoreMarketplaceRequests.find((r) => r.id === requestId);
      if (marketplaceReq) {
        const reqPath = `purchaseRequests/${requestId}`;
        const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
        const isStoreOwner = marketplaceReq.storeOwnerUid === firebaseUser.uid;
        const payload: Record<string, unknown> = {
          status,
          updatedAt: serverTimestamp(),
        };
        if (remarks !== undefined && (isStoreOwner || isAdminUser)) {
          payload.retailerRemarks = remarks.trim().slice(0, 300);
        }
        updateDoc(doc(db, 'purchaseRequests', requestId), payload).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, reqPath)
        );
      } else if (
        firestoreUserRequests.some((r) => r.id === requestId) &&
        (status === 'cancelled' || status === 'completed')
      ) {
        const reqPath = `users/${firebaseUser.uid}/requests/${requestId}`;
        updateDoc(doc(db, 'users', firebaseUser.uid, 'requests', requestId), {
          status,
          updatedAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, reqPath));
      }
    }
  };

  const updateStoreListing = (listingId: string, updates: Partial<StoreListing>) => {
    setStoreListings(prev =>
      prev.map(item =>
        item.id === listingId
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : item
      )
    );

    if (firebaseUser && firebaseUser.emailVerified && firestoreListingIds.has(listingId)) {
      const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.price !== undefined) payload.price = Math.max(0, Number(updates.price));
      if (updates.stockStatus !== undefined) payload.stockStatus = updates.stockStatus;
      if (updates.notes !== undefined) payload.notes = updates.notes.trim().slice(0, 200);

      const listingPath = `listings/${listingId}`;
      updateDoc(doc(db, 'listings', listingId), payload).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, listingPath)
      );
    }
  };

  const addStoreListing = (
    storeId: string,
    productId: string,
    price: number,
    stockStatus: StoreListing['stockStatus'],
    notes?: string
  ) => {
    const existing = storeListings.find(
      l => l.storeId === storeId && l.productId === productId
    );
    if (existing) {
      updateStoreListing(existing.id, { price, stockStatus, notes });
      return;
    }

    const newListingId = sanitizeId(`list_${Date.now()}`);
    const safeStoreId = sanitizeId(storeId);
    const safeProductId = sanitizeId(productId);
    const targetStore = stores.find((s) => s.id === safeStoreId);
    const ownerUid = targetStore?.ownerUid || firebaseUser?.uid;

    const newListing: StoreListing = {
      id: newListingId,
      storeId: safeStoreId,
      productId: safeProductId,
      ownerUid,
      price,
      stockStatus,
      notes,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setStoreListings(prev => [...prev, newListing]);

    if (
      firebaseUser &&
      firebaseUser.emailVerified &&
      firestoreStoreIds.has(safeStoreId) &&
      firestoreProductIds.has(safeProductId) &&
      (targetStore?.ownerUid === firebaseUser.uid || firebaseUser.email === ADMIN_EMAIL)
    ) {
      const listingPath = `listings/${newListingId}`;
      const payload: Record<string, unknown> = {
        id: newListingId,
        storeId: safeStoreId,
        productId: safeProductId,
        ownerUid: sanitizeId(ownerUid || firebaseUser.uid),
        price: Math.max(0, Number(price)),
        stockStatus,
        updatedAt: serverTimestamp(),
      };
      if (notes && notes.trim()) {
        payload.notes = notes.trim().slice(0, 200);
      }
      setDoc(doc(db, 'listings', newListingId), payload).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, listingPath)
      );
    }
  };

  const updateStoreProfile = (storeId: string, updates: Partial<Store>) => {
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, ...updates } : s))
    );

    if (firebaseUser && firebaseUser.emailVerified && firestoreStoreIds.has(storeId)) {
      const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined && updates.name.trim()) {
        payload.name = updates.name.trim().slice(0, 120);
      }
      if (updates.ownerName !== undefined && updates.ownerName.trim()) {
        payload.ownerName = updates.ownerName.trim().slice(0, 100);
      }
      if (updates.phone !== undefined && updates.phone.trim().length >= 10) {
        payload.phone = updates.phone.trim().slice(0, 30);
      }
      if (updates.locality !== undefined && updates.locality.trim()) {
        payload.locality = updates.locality.trim().slice(0, 80);
      }
      if (updates.fullAddress !== undefined && updates.fullAddress.trim()) {
        payload.fullAddress = updates.fullAddress.trim().slice(0, 250);
      }
      if (updates.landmark !== undefined) {
        payload.landmark = updates.landmark.trim().slice(0, 120);
      }
      if (updates.pincode !== undefined) {
        payload.pincode = updates.pincode.trim().slice(0, 12);
      }
      if (updates.openingHours !== undefined && updates.openingHours.trim()) {
        payload.openingHours = updates.openingHours.trim().slice(0, 80);
      }
      if (updates.categories !== undefined && updates.categories.length > 0) {
        payload.categories = updates.categories.slice(0, 10);
      }
      if (updates.image !== undefined) {
        payload.image = updates.image.trim().slice(0, 500);
      }
      if (updates.description !== undefined) {
        payload.description = updates.description.trim().slice(0, 500);
      }

      const storePath = `stores/${storeId}`;
      updateDoc(doc(db, 'stores', storeId), payload).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, storePath)
      );
    }
  };

  const addNewProductAndList = (
    productData: Omit<Product, 'id'>,
    storeId: string,
    price: number,
    stockStatus: StoreListing['stockStatus']
  ) => {
    const newProdId = sanitizeId(`prod_${Date.now()}`);
    const newListingId = sanitizeId(`list_${Date.now()}`);
    const safeStoreId = sanitizeId(storeId);
    const targetStore = stores.find((s) => s.id === safeStoreId);

    const newProduct: Product = {
      ...productData,
      id: newProdId,
    };
    setProducts(prev => [newProduct, ...prev]);

    const newListing: StoreListing = {
      id: newListingId,
      storeId: safeStoreId,
      productId: newProdId,
      ownerUid: targetStore?.ownerUid || firebaseUser?.uid,
      price,
      stockStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setStoreListings(prev => [newListing, ...prev]);

    if (firebaseUser && firebaseUser.emailVerified) {
      const prodPath = `products/${newProdId}`;
      const prodPayload: Record<string, unknown> = {
        id: newProdId,
        createdByUid: firebaseUser.uid,
        name: (productData.name || 'Local Product').trim().slice(0, 160),
        brand: (productData.brand || 'Local').trim().slice(0, 80),
        category: (productData.category || 'other').trim().slice(0, 60),
        description: (productData.description || '').trim().slice(0, 600),
        image: (productData.image || '').trim().slice(0, 500),
        unit: (productData.unit || '1 Unit').trim().slice(0, 60),
        mrp: Math.max(0, Number(productData.mrp || price || 0)),
        createdAt: serverTimestamp(),
      };

      setDoc(doc(db, 'products', newProdId), prodPayload)
        .then(() => {
          if (
            firestoreStoreIds.has(safeStoreId) &&
            (targetStore?.ownerUid === firebaseUser.uid || firebaseUser.email === ADMIN_EMAIL)
          ) {
            const listingPath = `listings/${newListingId}`;
            return setDoc(doc(db, 'listings', newListingId), {
              id: newListingId,
              storeId: safeStoreId,
              productId: newProdId,
              ownerUid: sanitizeId(targetStore?.ownerUid || firebaseUser.uid),
              price: Math.max(0, Number(price)),
              stockStatus,
              updatedAt: serverTimestamp(),
            }).catch((err) => handleFirestoreError(err, OperationType.CREATE, listingPath));
          }
        })
        .catch((err) => handleFirestoreError(err, OperationType.CREATE, prodPath));
    }
  };

  const registerNewStore = (storeData: Partial<Store>): string => {
    const newStoreId = sanitizeId(`store_${Date.now()}`);
    const rawPhone = (storeData.phone || '+91 98000 00000').trim();
    const safePhone = rawPhone.length >= 10 ? rawPhone.slice(0, 30) : '+91 98000 00000';
    const safeCategories =
      storeData.categories && storeData.categories.length > 0
        ? storeData.categories.slice(0, 10)
        : ['groceries'];

    const newStore: Store = {
      id: newStoreId,
      ownerUid: firebaseUser?.uid,
      name: (storeData.name || 'New Local Store').slice(0, 120),
      ownerName: (storeData.ownerName || 'Store Owner').slice(0, 100),
      phone: safePhone,
      locality: (storeData.locality || 'Karanpur').slice(0, 80),
      fullAddress: (storeData.fullAddress || 'Dehradun, Uttarakhand').slice(0, 250),
      landmark: (storeData.landmark || 'Near Main Chowk').slice(0, 120),
      pincode: (storeData.pincode || '248001').slice(0, 12),
      rating: 5.0,
      reviewCount: 0,
      openingHours: (storeData.openingHours || '09:00 AM - 09:00 PM').slice(0, 80),
      status: 'pending_approval',
      verified: false,
      categories: safeCategories,
      image: (
        storeData.image ||
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
      ).slice(0, 500),
      description: (
        storeData.description ||
        'Neighbourhood shop serving local residents and students.'
      ).slice(0, 500),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStores(prev => [newStore, ...prev]);

    if (firebaseUser && firebaseUser.emailVerified) {
      const storePath = `stores/${newStoreId}`;
      setDoc(doc(db, 'stores', newStoreId), {
        id: newStoreId,
        ownerUid: firebaseUser.uid,
        name: newStore.name,
        ownerName: newStore.ownerName,
        phone: newStore.phone,
        locality: newStore.locality,
        fullAddress: newStore.fullAddress,
        landmark: newStore.landmark,
        pincode: newStore.pincode,
        rating: 5.0,
        reviewCount: 0,
        openingHours: newStore.openingHours,
        status: 'pending_approval',
        verified: false,
        categories: safeCategories,
        image: newStore.image,
        description: newStore.description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          setCurrentUser((prev) => ({
            ...prev,
            associatedStoreId: newStoreId,
          }));
          return updateDoc(doc(db, 'users', firebaseUser.uid), {
            associatedStoreId: newStoreId,
            updatedAt: serverTimestamp(),
          });
        })
        .catch((err) => handleFirestoreError(err, OperationType.CREATE, storePath));
    }

    return newStoreId;
  };

  const approveStore = (storeId: string) => {
    setStores(prev =>
      prev.map(s =>
        s.id === storeId ? { ...s, status: 'active', verified: true } : s
      )
    );
    if (
      firebaseUser &&
      firebaseUser.email === ADMIN_EMAIL &&
      firebaseUser.emailVerified &&
      firestoreStoreIds.has(storeId)
    ) {
      updateDoc(doc(db, 'stores', storeId), {
        status: 'active',
        verified: true,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `stores/${storeId}`));
    }
  };

  const rejectStore = (storeId: string) => {
    setStores(prev =>
      prev.map(s =>
        s.id === storeId ? { ...s, status: 'suspended', verified: false } : s
      )
    );
    if (
      firebaseUser &&
      firebaseUser.email === ADMIN_EMAIL &&
      firebaseUser.emailVerified &&
      firestoreStoreIds.has(storeId)
    ) {
      updateDoc(doc(db, 'stores', storeId), {
        status: 'suspended',
        verified: false,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `stores/${storeId}`));
    }
  };

  const toggleStoreStatus = (storeId: string, status: 'active' | 'suspended') => {
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, status } : s))
    );
    if (
      firebaseUser &&
      firebaseUser.email === ADMIN_EMAIL &&
      firebaseUser.emailVerified &&
      firestoreStoreIds.has(storeId)
    ) {
      updateDoc(doc(db, 'stores', storeId), {
        status,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `stores/${storeId}`));
    }
  };

  const persistVentureDoc = (
    docId: 'scenarios' | 'milestones' | 'assumptions',
    items: unknown
  ) => {
    if (firebaseUser && firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified) {
      const path = `ventureData/${docId}`;
      setDoc(doc(db, 'ventureData', docId), {
        docType: docId,
        updatedByUid: firebaseUser.uid,
        payload: { items },
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.WRITE, path));
    }
  };

  const updateScenario = (id: string, updates: Partial<UnitEconomicsScenario>) => {
    setScenarios(prev => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          ...updates,
        },
      };
      persistVentureDoc('scenarios', next);
      return next;
    });
  };

  const updateValidationMilestone = (
    week: number,
    actualValue: number,
    notes: string,
    status: ValidationMilestone['status']
  ) => {
    setValidationMilestones(prev => {
      const next = prev.map(m =>
        m.week === week
          ? {
              ...m,
              actualValue,
              notes,
              status,
            }
          : m
      );
      persistVentureDoc('milestones', next);
      return next;
    });
  };

  const updateCoreAssumption = (id: string, updates: Partial<CoreAssumption>) => {
    setCoreAssumptions(prev => {
      const next = prev.map(a => (a.id === id ? { ...a, ...updates } : a));
      persistVentureDoc('assumptions', next);
      return next;
    });
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setStores(INITIAL_STORES);
    setProducts(INITIAL_PRODUCTS);
    setStoreListings(INITIAL_STORE_LISTINGS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setScenarios(INITIAL_SCENARIOS);
    setValidationMilestones(INITIAL_VALIDATION_MILESTONES);
    setCoreAssumptions(INITIAL_CORE_ASSUMPTIONS);
    setSavedStoreIds(['store_gupta_kirana', 'store_doon_book_world']);
    setSavedProductIds(['prod_classmate_spiral', 'prod_maggi_multipack']);
    setRecentSearches(['Classmate notebook', 'Maggi', 'Dove shampoo', 'A4 paper']);
    setSelectedLocality('All');
    setCurrentUser(INITIAL_USERS[0]);
    if (firebaseUser && firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified) {
      seedDatabaseNow();
    }
    navigateTo('landing');
  };

  const combinedPurchaseRequests = (() => {
    if (!firebaseUser) return purchaseRequests;
    const byId = new Map<string, PurchaseRequest>();
    firestoreMarketplaceRequests.forEach((r) => byId.set(r.id, r));
    firestoreUserRequests.forEach((r) => {
      if (!byId.has(r.id)) byId.set(r.id, r);
    });
    if (!isMarketplaceSeeded) {
      purchaseRequests.forEach((r) => {
        if (!byId.has(r.id)) byId.set(r.id, r);
      });
    }
    return Array.from(byId.values());
  })();

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        isAuthReady,
        authLoading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signOutGoogle,
        updateMyGoogleProfile,
        currentUser,
        switchRole,
        setCurrentUser,
        selectedLocality,
        setSelectedLocality,
        currentView,
        viewParam,
        navigateTo,
        stores,
        products,
        storeListings,
        purchaseRequests: combinedPurchaseRequests,
        localities: INITIAL_LOCALITIES,
        categories: INITIAL_CATEGORIES,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        recentSearches,
        addRecentSearch,
        savedStoreIds,
        savedProductIds,
        toggleSaveStore,
        toggleSaveProduct,
        submitPurchaseRequest,
        submitRequestFeedback,
        currentRetailerStore,
        updateStoreListing,
        addStoreListing,
        updateStoreProfile,
        addNewProductAndList,
        updateRequestStatus,
        registerNewStore,
        approveStore,
        rejectStore,
        toggleStoreStatus,
        scenarios,
        activeScenarioId,
        setActiveScenarioId,
        updateScenario,
        validationMilestones,
        updateValidationMilestone,
        coreAssumptions,
        updateCoreAssumption,
        isMarketplaceSeeded,
        seedingDatabase,
        isStoreInFirestore,
        seedDatabaseNow,
        submitStoreReview,
        submitSupportFeedback,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
