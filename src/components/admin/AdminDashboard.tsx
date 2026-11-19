import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Store as StoreIcon,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  Star,
  Settings,
  Database,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    firebaseUser,
    isMarketplaceSeeded,
    seedingDatabase,
    seedDatabaseNow,
    stores,
    products,
    storeListings,
    purchaseRequests,
    localities,
    categories,
    approveStore,
    rejectStore,
    toggleStoreStatus,
    updateRequestStatus,
    switchRole,
    navigateTo,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'approvals' | 'stores' | 'requests' | 'reviews'>('overview');

  // Pending stores queue
  const pendingStores = stores.filter(s => s.status === 'pending_approval');
  const activeStores = stores.filter(s => s.status === 'active');
  const suspendedStores = stores.filter(s => s.status === 'suspended');

  // Transactions & Platform Metrics
  const completedOrders = purchaseRequests.filter(r => r.status === 'completed');
  const totalGMV = completedOrders.reduce((sum, r) => sum + r.totalAmount, 0);
  const commissionRate = 0.10; // 10%
  const platformRevenue = Math.round(totalGMV * commissionRate);

  const reviewsList = purchaseRequests.filter(r => r.rating !== undefined && r.rating > 0);

  // Security check: If someone isn't admin role, show auth warning
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Admin Access Required</h2>
        <p className="text-xs text-slate-500">
          You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). 
          Administrative privileges are restricted to authorised platform operators.
        </p>
        <button
          onClick={() => switchRole('admin')}
          className="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition-colors"
        >
          Switch to Platform Admin Persona
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>LocalKart Operations Center · Dehradun</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Platform Administration & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise retailer registrations, monitor customer purchase requests, and review platform unit performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              switchRole('founder');
              navigateTo('founder_workspace');
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>DGU Venture Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cloud Firestore Sync Status Bar */}
      <div className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isMarketplaceSeeded
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isMarketplaceSeeded ? 'bg-emerald-800 text-white' : 'bg-amber-600 text-white'
          }`}>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Cloud Firestore Database:</span>
              <span>{isMarketplaceSeeded ? 'Live Synced' : 'Local Fallback Active'}</span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {firebaseUser?.email === 'namanbhattarai7@gmail.com'
                ? 'Signed in as verified platform admin. Stores, products, listings, purchase requests, and venture configs sync directly to Cloud Firestore.'
                : 'Sign in with the verified admin Gmail account (namanbhattarai7@gmail.com) to seed and persist the live marketplace catalog to Cloud Firestore.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {firebaseUser?.email === 'namanbhattarai7@gmail.com' ? (
            <button
              onClick={() => seedDatabaseNow()}
              disabled={seedingDatabase}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seedingDatabase ? 'animate-spin' : ''}`} />
              <span>{seedingDatabase ? 'Syncing...' : isMarketplaceSeeded ? 'Re-Seed Demo Catalog' : 'Seed Demo Data to Firestore'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('auth')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
            >
              Sign in with Admin Gmail
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Active Stores</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{activeStores.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {pendingStores.length > 0 ? `${pendingStores.length} Pending Approval` : 'All Verified'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Live Product Listings</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{storeListings.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across {products.length} master products</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Purchase Requests</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{purchaseRequests.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{completedOrders.length} completed at counter</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Gross GMV / Commission</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">₹{totalGMV}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">₹{platformRevenue} Est. 10% Cut</div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`pb-3 px-3 transition-colors whitespace-nowrap ${
            activeAdminTab === 'overview'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Operations Overview
        </button>

        <button
          onClick={() => setActiveAdminTab('approvals')}
          className={`pb-3 px-3 transition-colors whitespace-nowrap relative ${
            activeAdminTab === 'approvals'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Verifications
          {pendingStores.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white">
              {pendingStores.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('stores')}
          className={`pb-3 px-3 transition-colors whitespace-nowrap ${
            activeAdminTab === 'stores'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Retailer Management ({stores.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('requests')}
          className={`pb-3 px-3 transition-colors whitespace-nowrap ${
            activeAdminTab === 'requests'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Platform Requests ({purchaseRequests.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('reviews')}
          className={`pb-3 px-3 transition-colors whitespace-nowrap ${
            activeAdminTab === 'reviews'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Customer Reviews ({reviewsList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & REVENUE MODEL */}
      {activeAdminTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Status Notice */}
            {pendingStores.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900">
                      {pendingStores.length} merchant application awaiting your review.
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Verify physical location and shop category before publishing to Dehradun students.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAdminTab('approvals')}
                  className="px-3 py-1.5 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 transition-colors shrink-0"
                >
                  Review Now
                </button>
              </div>
            )}

            {/* Localities Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dehradun Active Locality Coverage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {localities.map(loc => {
                  const locStores = stores.filter(s => s.locality === loc.name && s.status === 'active');
                  return (
                    <div key={loc.id} className="p-3 bg-slate-50 rounded-lg text-xs">
                      <div className="font-bold text-slate-900">{loc.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {locStores.length} active stores
                      </div>
                      <div className="text-[10px] text-emerald-800 mt-1 capitalize font-medium">
                        {loc.areaType}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master Categories Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Category Distribution
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {categories.map(cat => {
                  const prodCount = products.filter(p => p.category === cat.id).length;
                  const storeCount = stores.filter(s => s.categories.includes(cat.id)).length;
                  return (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                        <p className="text-[11px] text-slate-500">{cat.description}</p>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="font-semibold text-slate-800">{prodCount} products</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-600">{storeCount} stores</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue Model Summary (Section 7 alignment) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Business Model Parameters
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Commission Economics
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Commission Rate</span>
                <span className="font-bold text-slate-900">10% per transaction</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Completed Orders (Live)</span>
                <span className="font-bold text-slate-900">{completedOrders.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Measured GMV</span>
                <span className="font-bold text-slate-900">₹{totalGMV}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Actualised Commission</span>
                <span className="font-bold text-emerald-900">₹{platformRevenue}</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
              <p className="font-bold">DGU Venture Plan Integration</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Configure full variable and fixed cost scenarios (₹14 vs ₹25 variable cost, ₹30k fixed cost) in the Founder Workspace.
              </p>
              <button
                onClick={() => {
                  switchRole('founder');
                  navigateTo('founder_workspace');
                }}
                className="mt-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded transition-colors"
              >
                Launch Unit Economics Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING STORE APPROVALS */}
      {activeAdminTab === 'approvals' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Pending Retailer Applications ({pendingStores.length})
          </h3>

          {pendingStores.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              No pending merchant verifications at this time. All stores are verified.
            </div>
          ) : (
            pendingStores.map(store => (
              <div
                key={store.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Pending Verification
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{store.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Registered: {store.createdAt}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <div><strong>Proprietor:</strong> {store.ownerName}</div>
                    <div><strong>Contact:</strong> {store.phone}</div>
                    <div><strong>Locality:</strong> {store.locality}</div>
                  </div>
                  <div>
                    <div><strong>Address:</strong> {store.fullAddress}</div>
                    <div><strong>Landmark:</strong> {store.landmark}</div>
                    <div><strong>Hours:</strong> {store.openingHours}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">
                  "{store.description}"
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => rejectStore(store.id)}
                    className="px-3.5 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => approveStore(store.id)}
                    className="px-4 py-1.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold transition-colors shadow-xs"
                  >
                    Approve & Publish to Marketplace
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ALL STORES MANAGEMENT */}
      {activeAdminTab === 'stores' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
          {stores.map(store => {
            const listingsCount = storeListings.filter(l => l.storeId === store.id).length;
            const isSuspended = store.status === 'suspended';

            return (
              <div key={store.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{store.name}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                      store.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : store.status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {store.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {store.locality} · {store.ownerName} · {store.phone}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {listingsCount} products listed · Rating: {store.rating} ({store.reviewCount} reviews)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('store_profile', store.id)}
                    className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                  >
                    View Page
                  </button>
                  {store.status === 'active' ? (
                    <button
                      onClick={() => toggleStoreStatus(store.id, 'suspended')}
                      className="px-3 py-1 text-xs text-red-700 hover:bg-red-50 rounded font-medium"
                    >
                      Suspend Store
                    </button>
                  ) : (
                    <button
                      onClick={() => approveStore(store.id)}
                      className="px-3 py-1 text-xs bg-emerald-800 text-white hover:bg-emerald-900 rounded font-bold"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: PLATFORM REQUESTS FEED */}
      {activeAdminTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
          {purchaseRequests.map(req => (
            <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{req.referenceNumber}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{req.createdAt}</span>
                </div>
                <div className="mt-1 text-slate-700">
                  Customer: <strong>{req.customerName}</strong> ({req.customerPhone}) → Store: <strong>{req.storeName}</strong>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Items: {req.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-950 text-sm">₹{req.totalAmount}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                  req.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800'
                    : req.status === 'submitted'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-blue-50 text-blue-800'
                }`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: CUSTOMER REVIEWS */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Customer Feedback & Store Ratings ({reviewsList.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsList.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{req.customerName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: req.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Store: <strong className="text-slate-700">{req.storeName}</strong> · Ref: {req.referenceNumber}
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded italic">
                  "{req.reviewText || 'No detailed remark provided.'}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
