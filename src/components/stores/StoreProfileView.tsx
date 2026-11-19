import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { useApp } from '../../context/AppContext';
import { PurchaseRequestModal } from '../discovery/PurchaseRequestModal';
import { Product, StoreListing } from '../../types';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  Bookmark,
  ArrowLeft,
  Share2,
  Search,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const StoreProfileView: React.FC = () => {
  const {
    stores,
    products,
    storeListings,
    viewParam,
    navigateTo,
    savedStoreIds,
    toggleSaveStore,
    currentUser,
    firebaseUser,
    isAuthReady,
    isStoreInFirestore,
    submitStoreReview,
  } = useApp();

  const storeId = viewParam || 'store_gupta_kirana';
  const store = stores.find(s => s.id === storeId) || stores[0];

  const [searchInStore, setSearchInStore] = useState('');
  const [selectedProductForRequest, setSelectedProductForRequest] = useState<{
    product: Product;
    listing: StoreListing;
  } | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const defaultDemoReviews = [
    {
      id: 'rev_1',
      customerName: 'Aarav Sharma (GEU Student)',
      rating: 5,
      date: '2026-10-12',
      comment: 'Always keeps standard registers and drawing charts in stock. Very polite uncle!',
    },
    {
      id: 'rev_2',
      customerName: 'Deepak Nautiyal',
      rating: 5,
      date: '2026-10-10',
      comment: 'Saved me a trip to Paltan Bazaar. Reserved my Maggi and tea on LocalKart and picked up on way home.',
    },
  ];

  const [reviews, setReviews] = useState(defaultDemoReviews);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const storeInFirestore = isStoreInFirestore(store.id);

  useEffect(() => {
    if (!isAuthReady || !storeInFirestore) {
      setReviews(defaultDemoReviews);
      return;
    }

    const reviewsPath = `stores/${store.id}/reviews`;
    const q = query(
      collection(db, 'stores', store.id, 'reviews'),
      where('storeId', '==', store.id)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setReviews(defaultDemoReviews);
          return;
        }
        const loaded = snap.docs
          .map((docSnap) => {
            const d = docSnap.data();
            const createdMs = d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : Date.now();
            const dateStr =
              d.createdAt instanceof Timestamp
                ? d.createdAt.toDate().toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10);
            return {
              id: docSnap.id,
              customerName: String(d.customerName || 'Customer'),
              rating: Number(d.rating || 5),
              date: dateStr,
              comment: String(d.comment || ''),
              createdMs,
            };
          })
          .sort((a, b) => b.createdMs - a.createdMs)
          .map(({ id, customerName, rating, date, comment }) => ({
            id,
            customerName,
            rating,
            date,
            comment,
          }));
        setReviews(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, reviewsPath);
      }
    );

    return () => unsub();
  }, [isAuthReady, store.id, storeInFirestore]);

  // Store's active listings
  const listings = storeListings.filter(l => l.storeId === store.id);

  // Map listings to full products
  const storeInventory = listings
    .map(listing => {
      const prod = products.find(p => p.id === listing.productId);
      return {
        listing,
        product: prod,
      };
    })
    .filter((item): item is { listing: StoreListing; product: Product } => item.product !== undefined);

  // Filter in-store search
  const filteredInventory = storeInventory.filter(({ product }) => {
    if (!searchInStore.trim()) return true;
    const q = searchInStore.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    );
  });

  const isSaved = savedStoreIds.includes(store.id);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      if (firebaseUser && storeInFirestore) {
        await submitStoreReview(store.id, newRating, newReviewText);
      } else {
        setReviews([
          {
            id: `rev_${Date.now()}`,
            customerName: currentUser.name,
            rating: newRating,
            date: new Date().toISOString().slice(0, 10),
            comment: newReviewText.trim(),
          },
          ...reviews,
        ]);
      }
      setNewReviewText('');
      setReviewSubmitted(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <button
        onClick={() => navigateTo('store_directory')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Directory</span>
      </button>

      {/* Success Notification */}
      {successRef && (
        <div className="bg-emerald-900 text-white rounded-xl p-4 flex items-center justify-between border border-emerald-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <div>
              <p className="text-xs font-bold">Pickup Request Submitted to {store.name}!</p>
              <p className="text-[11px] text-emerald-200">
                Order Ref: <span className="font-mono font-bold text-white">{successRef}</span>. The merchant has received your request.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('customer_dashboard')}
            className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-950 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Track in My Orders
          </button>
        </div>
      )}

      {/* Store Header Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="relative h-48 sm:h-64 bg-slate-900">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleSaveStore(store.id)}
              className="p-2 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved Store' : 'Save'}</span>
            </button>
          </div>

          {/* Overlay Bottom Content */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {store.verified && (
                <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Local Partner
                </span>
              )}
              <span className="text-xs text-emerald-200 font-medium">
                {store.locality}, Dehradun
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {store.name}
            </h1>
          </div>
        </div>

        {/* Store Metadata Strip */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {store.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Address:</strong> {store.fullAddress} (Landmark: {store.landmark})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Hours:</strong> {store.openingHours}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Owner Contact:</strong> {store.ownerName} ({store.phone})
                </span>
              </div>
            </div>
          </div>

          {/* Rating & Contact Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Store Rating</span>
                <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{store.rating}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Based on {reviews.length} local customer reviews
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <a
                href={`tel:${store.phone.replace(/\s+/g, '')}`}
                className="w-full py-2 px-3 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store ({store.phone})</span>
              </a>
              <div className="text-[10px] text-slate-500 text-center">
                Cash or UPI payment accepted at billing counter
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store Product Catalog */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Live Product Catalog & Availability
            </h2>
            <p className="text-xs text-slate-500">
              Showing items listed by {store.name}
            </p>
          </div>

          {/* Search within store */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchInStore}
              onChange={(e) => setSearchInStore(e.target.value)}
              placeholder="Search inside this store..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No products in this store matched your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredInventory.map(({ product, listing }) => {
              const isOutOfStock = listing.stockStatus === 'out_of_stock';
              const isLimited = listing.stockStatus === 'limited';

              return (
                <div
                  key={listing.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-50 p-3 flex items-center justify-center border-b border-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {product.brand} · {product.unit}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {product.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-emerald-950">
                          ₹{listing.price}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Out of Stock
                          </span>
                        ) : isLimited ? (
                          <span className="text-[10px] font-semibold text-amber-700">
                            Limited Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => setSelectedProductForRequest({ product, listing })}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                        }`}
                      >
                        <span>{isOutOfStock ? 'Unavailable' : 'Request Pickup'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customer Reviews & Feedback Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Feedback & Verification
            </h3>
            <p className="text-xs text-slate-500">
              Real reviews from neighbourhood shoppers in {store.locality}
            </p>
          </div>
        </div>

        {/* Existing Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{rev.customerName}</span>
                <span className="text-slate-400 text-[11px]">{rev.date}</span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>

        {/* Review Form */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Leave Feedback for {store.name}
          </h4>
          {reviewSubmitted ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg">
              Thank you! Your feedback has been recorded for this local merchant.
            </div>
          ) : (
            <form onSubmit={handleAddReview} className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600 font-medium">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= newRating ? 'fill-amber-500' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your pickup experience, pricing fairness, or stock availability..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                {!firebaseUser && (
                  <button
                    type="button"
                    onClick={() => navigateTo('auth')}
                    className="text-[11px] font-semibold text-emerald-800 hover:underline"
                  >
                    Sign in with Google to save your review permanently
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Modal for Requesting a Product */}
      {selectedProductForRequest && (
        <PurchaseRequestModal
          product={selectedProductForRequest.product}
          store={store}
          listing={selectedProductForRequest.listing}
          onClose={() => setSelectedProductForRequest(null)}
          onSuccess={(refNum) => {
            setSelectedProductForRequest(null);
            setSuccessRef(refNum);
          }}
        />
      )}
    </div>
  );
};
