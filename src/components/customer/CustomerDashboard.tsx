import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseRequest, RequestStatus } from '../../types';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Bookmark,
  Search,
  Star,
  ArrowRight,
  RotateCcw,
  Store as StoreIcon,
  LogIn,
  Settings,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const {
    firebaseUser,
    signInWithGoogle,
    currentUser,
    purchaseRequests,
    stores,
    products,
    savedStoreIds,
    savedProductIds,
    recentSearches,
    updateRequestStatus,
    submitRequestFeedback,
    setSearchQuery,
    navigateTo,
    toggleSaveStore,
    toggleSaveProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'saved' | 'history'>('requests');
  const [feedbackModalRequest, setFeedbackModalRequest] = useState<PurchaseRequest | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Customer requests
  const customerRequests = purchaseRequests.filter(
    r => r.customerId === currentUser.id
  );

  const savedStores = stores.filter(s => savedStoreIds.includes(s.id));
  const savedProducts = products.filter(p => savedProductIds.includes(p.id));

  const getStatusStepIndex = (status: RequestStatus) => {
    switch (status) {
      case 'submitted': return 0;
      case 'accepted': return 1;
      case 'ready_for_pickup': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Submitted (Awaiting Retailer)</span>;
      case 'accepted':
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Accepted by Store</span>;
      case 'ready_for_pickup':
        return <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md animate-pulse">Ready for Pickup</span>;
      case 'completed':
        return <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>;
      case 'cancelled':
        return <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Cancelled</span>;
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalRequest) return;
    submitRequestFeedback(feedbackModalRequest.id, feedbackRating, feedbackText);
    setFeedbackModalRequest(null);
    setFeedbackText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Google Sign-In Callout when using Guest Demo */}
      {!firebaseUser && (
        <div className="bg-emerald-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-800 shadow-xs">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Sync Your Orders Across Devices
            </div>
            <h2 className="text-sm font-bold">
              Sign in with your Gmail / Google Account to save requests & favourites
            </h2>
            <p className="text-xs text-emerald-200/90">
              Currently viewing local demo preview. Sign in with Google in one click for verified Dehradun pickup requests.
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 rounded-lg text-xs font-bold transition-colors shrink-0 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {firebaseUser && currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xl border-2 border-emerald-300">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {firebaseUser ? 'Verified Google Account · Student / Shopper Portal' : 'Student / Shopper Portal (Demo Preview)'}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentUser.name}
            </h1>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
              <span>{currentUser.email}</span>
              {currentUser.phone && (
                <>
                  <span>·</span>
                  <span>{currentUser.phone}</span>
                </>
              )}
              <span>·</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3 h-3 text-emerald-700" />
                {currentUser.locality}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {firebaseUser && (
            <button
              onClick={() => navigateTo('auth')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>
          )}
          <button
            onClick={() => navigateTo('discovery')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Products</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'requests'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Purchase Requests ({customerRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'saved'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Saved Stores & Items ({savedStores.length + savedProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'history'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Search History ({recentSearches.length})
        </button>
      </div>

      {/* TAB 1: PURCHASE REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {customerRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3 max-w-md mx-auto">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No purchase requests yet</h3>
              <p className="text-xs text-slate-500">
                Search local stores in Dehradun and submit your first reservation request!
              </p>
              <button
                onClick={() => navigateTo('discovery')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            customerRequests.map(request => {
              const store = stores.find(s => s.id === request.storeId);
              const stepIndex = getStatusStepIndex(request.status);
              const isFinished = request.status === 'completed' || request.status === 'cancelled';

              return (
                <div
                  key={request.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {request.referenceNumber}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500">{request.createdAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <StoreIcon className="w-4 h-4 text-emerald-800" />
                        <span>{request.storeName}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {/* Step Timeline Indicator */}
                  {request.status !== 'cancelled' && (
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        {[
                          { title: '1. Submitted', desc: 'Sent to store' },
                          { title: '2. Accepted', desc: 'Items confirmed' },
                          { title: '3. Ready for Pickup', desc: 'Packed at counter' },
                          { title: '4. Completed', desc: 'Collected & Paid' },
                        ].map((step, idx) => {
                          const isActive = idx <= stepIndex;
                          const isCurrent = idx === stepIndex;
                          return (
                            <div key={step.title} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full transition-colors ${
                                  isActive ? 'bg-emerald-700' : 'bg-slate-200'
                                }`}
                              />
                              <div className={`font-semibold ${isCurrent ? 'text-emerald-950 font-bold' : isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.title}
                              </div>
                              <div className="text-[9px] text-slate-400 hidden sm:block">
                                {step.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items Ordered */}
                  <div className="space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {request.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-8 h-8 rounded object-contain bg-white border border-slate-200 p-0.5"
                          />
                          <div>
                            <span className="font-semibold text-slate-800">{item.productName}</span>
                            <span className="text-slate-500 ml-1.5">× {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹{item.total}</span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>Total Payable on Pickup:</span>
                      <span className="text-base text-emerald-950">₹{request.totalAmount}</span>
                    </div>
                  </div>

                  {/* Remarks & Pickup Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Store Pickup Location</div>
                      <div className="text-slate-800 font-medium mt-0.5">
                        {store?.fullAddress || 'Near Main Market, Dehradun'}
                      </div>
                      {store?.phone && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                          <Phone className="w-3 h-3" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Pickup Slot & Remarks</div>
                      <div className="text-slate-800 font-medium mt-0.5">
                        Preferred: {request.preferredPickupTime || 'Within 2 Hours'}
                      </div>
                      {request.retailerRemarks && (
                        <div className="mt-1 text-[11px] text-emerald-900 font-medium italic">
                          Store Remark: "{request.retailerRemarks}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-slate-500">
                      Need help? Call store or visit before closing time ({store?.openingHours}).
                    </div>

                    <div className="flex items-center gap-2">
                      {request.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'completed', 'Customer marked collected')}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Mark Collected / Completed
                        </button>
                      )}

                      {request.status === 'submitted' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'cancelled', 'Cancelled by customer')}
                          className="px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}

                      {request.status === 'completed' && !request.rating && (
                        <button
                          onClick={() => setFeedbackModalRequest(request)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Leave Rating</span>
                        </button>
                      )}

                      {request.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Rated {request.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SAVED STORES & PRODUCTS */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Saved Stores */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Saved Favourite Stores ({savedStores.length})
            </h3>
            {savedStores.length === 0 ? (
              <p className="text-xs text-slate-500">No saved stores.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedStores.map(store => (
                  <div key={store.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{store.name}</h4>
                      <p className="text-[11px] text-slate-500">{store.locality}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('store_profile', store.id)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-semibold"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Products */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Saved Products ({savedProducts.length})
            </h3>
            {savedProducts.length === 0 ? (
              <p className="text-xs text-slate-500">No saved products.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProducts.map(prod => (
                  <div key={prod.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="w-12 h-12 object-contain bg-slate-50 rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500">MRP ₹{prod.mrp}</p>
                    </div>
                    <button
                      onClick={() => navigateTo('discovery', { selectedProductId: prod.id })}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:underline"
                    >
                      Compare
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Searches</h3>
          <p className="text-xs text-slate-500">Click any previous search to quickly find local inventory</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {recentSearches.map(query => (
              <button
                key={query}
                onClick={() => {
                  setSearchQuery(query);
                  navigateTo('discovery');
                }}
                className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Rating Modal */}
      {feedbackModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Rate Your Experience with {feedbackModalRequest.storeName}
            </h3>
            <p className="text-xs text-slate-500">
              Order Ref: {feedbackModalRequest.referenceNumber}
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Was the item packed as requested? How was the price and pickup speed?"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalRequest(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
