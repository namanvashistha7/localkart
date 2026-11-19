import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_LISTINGS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_SCENARIOS,
  INITIAL_VALIDATION_MILESTONES,
  INITIAL_CORE_ASSUMPTIONS,
} from '../data/mockData';

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned || `id_${Date.now()}`;
}

export async function isFirestoreMarketplaceSeeded(): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'stores'),
      where('status', '==', 'active'),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'stores');
  }
}

/**
 * Seeds the initial Dehradun demo catalog into Cloud Firestore using two ordered
 * batches so relational exists() checks on stores/products pass before listings/requests.
 */
export async function seedFirestoreMarketplace(adminUid: string): Promise<void> {
  const safeAdminUid = sanitizeId(adminUid);

  // Batch 1: Stores, Products, and Venture Config
  try {
    const batch1 = writeBatch(db);

    for (const store of INITIAL_STORES) {
      const storeId = sanitizeId(store.id);
      batch1.set(doc(db, 'stores', storeId), {
        id: storeId,
        ownerUid: safeAdminUid,
        name: store.name.slice(0, 120),
        ownerName: store.ownerName.slice(0, 100),
        phone: store.phone.slice(0, 30),
        locality: store.locality.slice(0, 80),
        fullAddress: store.fullAddress.slice(0, 250),
        landmark: (store.landmark || '').slice(0, 120),
        pincode: (store.pincode || '248001').slice(0, 12),
        rating: Number(store.rating),
        reviewCount: Number(store.reviewCount),
        openingHours: store.openingHours.slice(0, 80),
        status: store.status,
        verified: Boolean(store.verified),
        categories: store.categories.slice(0, 10),
        image: (store.image || '').slice(0, 500),
        description: (store.description || '').slice(0, 500),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const prod of INITIAL_PRODUCTS) {
      const prodId = sanitizeId(prod.id);
      batch1.set(doc(db, 'products', prodId), {
        id: prodId,
        createdByUid: safeAdminUid,
        name: prod.name.slice(0, 160),
        brand: prod.brand.slice(0, 80),
        category: prod.category.slice(0, 60),
        description: (prod.description || '').slice(0, 600),
        image: (prod.image || '').slice(0, 500),
        unit: prod.unit.slice(0, 60),
        mrp: Number(prod.mrp),
        createdAt: serverTimestamp(),
      });
    }

    batch1.set(doc(db, 'ventureData', 'scenarios'), {
      docType: 'scenarios',
      updatedByUid: safeAdminUid,
      payload: { items: INITIAL_SCENARIOS },
      updatedAt: serverTimestamp(),
    });

    batch1.set(doc(db, 'ventureData', 'milestones'), {
      docType: 'milestones',
      updatedByUid: safeAdminUid,
      payload: { items: INITIAL_VALIDATION_MILESTONES },
      updatedAt: serverTimestamp(),
    });

    batch1.set(doc(db, 'ventureData', 'assumptions'), {
      docType: 'assumptions',
      updatedByUid: safeAdminUid,
      payload: { items: INITIAL_CORE_ASSUMPTIONS },
      updatedAt: serverTimestamp(),
    });

    await batch1.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'stores_products_seed');
  }

  // Batch 2: Store Listings & Initial Purchase Requests (depends on stores & products existing)
  try {
    const batch2 = writeBatch(db);

    for (const listing of INITIAL_STORE_LISTINGS) {
      const listingId = sanitizeId(listing.id);
      const payload: Record<string, unknown> = {
        id: listingId,
        storeId: sanitizeId(listing.storeId),
        productId: sanitizeId(listing.productId),
        ownerUid: safeAdminUid,
        price: Number(listing.price),
        stockStatus: listing.stockStatus,
        updatedAt: serverTimestamp(),
      };
      if (listing.notes) {
        payload.notes = listing.notes.slice(0, 200);
      }
      batch2.set(doc(db, 'listings', listingId), payload);
    }

    for (const req of INITIAL_PURCHASE_REQUESTS) {
      const reqId = sanitizeId(req.id);
      const itemSummary = req.items
        .map((i) => `${i.productName} (x${i.quantity})`)
        .join(', ')
        .slice(0, 500);
      const payload: Record<string, unknown> = {
        id: reqId,
        referenceNumber: req.referenceNumber.slice(0, 40),
        customerId: sanitizeId(req.customerId),
        customerName: req.customerName.slice(0, 100),
        customerPhone: req.customerPhone.slice(0, 30),
        customerLocality: req.customerLocality.slice(0, 80),
        storeId: sanitizeId(req.storeId),
        storeOwnerUid: safeAdminUid,
        storeName: req.storeName.slice(0, 120),
        itemSummary: itemSummary || 'Store Order',
        totalAmount: Number(req.totalAmount),
        status: req.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (req.pickupNotes) payload.pickupNotes = req.pickupNotes.slice(0, 300);
      if (req.preferredPickupTime) payload.preferredPickupTime = req.preferredPickupTime.slice(0, 80);
      if (req.retailerRemarks) payload.retailerRemarks = req.retailerRemarks.slice(0, 300);
      if (req.rating !== undefined) payload.rating = Number(req.rating);
      if (req.reviewText) payload.reviewText = req.reviewText.slice(0, 500);

      batch2.set(doc(db, 'purchaseRequests', reqId), payload);
    }

    await batch2.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'listings_requests_seed');
  }
}
