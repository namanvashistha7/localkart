import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Store, StoreListing } from '../../types';
import { PurchaseRequestModal } from './PurchaseRequestModal';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Bookmark,
  Store as StoreIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onRequestSubmitted: (refNumber: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onRequestSubmitted,
}) => {
  const {
    stores,
    storeListings,
    selectedLocality,
    savedProductIds,
    toggleSaveProduct,
    navigateTo,
  } = useApp();

  const [selectedStoreForRequest, setSelectedStoreForRequest] = useState<{
    store: Store;
    listing: StoreListing;
  } | null>(null);

  // All listings for this product
  const listings = storeListings.filter(l => l.productId === product.id);

  // Attach store info to each listing
  const storeComparison = listings
    .map(listing => {
      const store = stores.find(s => s.id === listing.storeId);
      return {
        listing,
        store,
      };
    })
    .filter((item): item is { listing: StoreListing; store: Store } => item.store !== undefined);

  // Sort by in-stock first, then price low to high
  storeComparison.sort((a, b) => {
    if (a.listing.stockStatus === 'out_of_stock' && b.listing.stockStatus !== 'out_of_stock') return 1;
    if (b.listing.stockStatus === 'out_of_stock' && a.listing.stockStatus !== 'out_of_stock') return -1;
    return a.listing.price - b.listing.price;
  });

  const isSaved = savedProductIds.includes(product.id);

  const getStockBadge = (status: StoreListing['stockStatus']) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            In Stock
          </span>
        );
      case 'limited':
        return (
          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Limited Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            Out of Stock
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              Product ID: #{product.id.replace('prod_', '')} · Category: <span className="capitalize">{product.category.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSaveProduct(product.id)}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                  isSaved ? 'text-emerald-800 bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                <span className="text-[11px] hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-6 pt-4">
            {/* Product Overview Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <div className="sm:col-span-1 bg-slate-50 rounded-xl p-4 flex items-center justify-center border border-slate-200 h-52">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                    {product.brand}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug mt-0.5">
                    {product.name}
                  </h2>
                  <div className="text-xs text-slate-500 mt-1">
                    Pack / Size: <span className="font-medium text-slate-700">{product.unit}</span>
                    <span className="mx-2">·</span>
                    MRP: <span className="font-semibold text-slate-700">₹{product.mrp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  {product.description}
                </p>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-emerald-700" />
                  <span>
                    Available across <strong className="text-slate-800">{storeComparison.length} neighbourhood stores</strong> in Dehradun
                  </span>
                </div>
              </div>
            </div>

            {/* Store Comparison Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Compare Prices & Availability Across Stores
                </h3>
                <span className="text-[11px] text-slate-500">
                  Sorted by best price & stock
                </span>
              </div>

              {storeComparison.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-600 font-medium">
                    No participating retailers currently have this product listed.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check back soon or submit a request to notify local merchants in your area.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {storeComparison.map(({ listing, store }) => {
                    const isLocalMatch = selectedLocality !== 'All' && store.locality === selectedLocality;
                    const isOutOfStock = listing.stockStatus === 'out_of_stock';
                    const savings = product.mrp > listing.price ? product.mrp - listing.price : 0;

                    return (
                      <div
                        key={store.id}
                        className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isLocalMatch ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* Store Info */}
                        <div className="space-y-1 sm:max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 hover:text-emerald-800 cursor-pointer"
                              onClick={() => {
                                onClose();
                                navigateTo('store_profile', store.id);
                              }}
                            >
                              {store.name}
                            </h4>
                            {store.verified && (
                              <span title="Verified Local Store">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>{store.locality}</span>
                            {isLocalMatch && (
                              <span className="text-[10px] text-emerald-800 font-semibold ml-1">
                                (Your Area)
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{store.openingHours}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5 text-amber-700">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {store.rating}
                            </span>
                          </div>

                          {listing.notes && (
                            <p className="text-[10px] text-slate-500 italic">
                              "{listing.notes}"
                            </p>
                          )}
                        </div>

                        {/* Price & Stock */}
                        <div className="flex items-center sm:items-end justify-between sm:justify-center flex-row sm:flex-col gap-1 sm:text-right">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-emerald-950">
                              ₹{listing.price}
                            </span>
                            {savings > 0 && (
                              <span className="text-[11px] text-emerald-700 font-medium">
                                Save ₹{savings}
                              </span>
                            )}
                          </div>
                          <div>{getStockBadge(listing.stockStatus)}</div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            disabled={isOutOfStock}
                            onClick={() => setSelectedStoreForRequest({ store, listing })}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                              isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                            }`}
                          >
                            <span>{isOutOfStock ? 'Unavailable' : 'Request Pickup'}</span>
                            {!isOutOfStock && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Request Modal */}
      {selectedStoreForRequest && (
        <PurchaseRequestModal
          product={product}
          store={selectedStoreForRequest.store}
          listing={selectedStoreForRequest.listing}
          onClose={() => setSelectedStoreForRequest(null)}
          onSuccess={(refNum) => {
            setSelectedStoreForRequest(null);
            onClose();
            onRequestSubmitted(refNum);
          }}
        />
      )}
    </>
  );
};
