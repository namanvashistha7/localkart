import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreListing, StockStatus, Product } from '../../types';
import {
  Store as StoreIcon,
  ShoppingBag,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Save,
  Trash2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';

export const RetailerDashboard: React.FC = () => {
  const {
    currentUser,
    currentRetailerStore,
    stores,
    products,
    storeListings,
    purchaseRequests,
    updateRequestStatus,
    updateStoreListing,
    addStoreListing,
    updateStoreProfile,
    addNewProductAndList,
    categories,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'products' | 'profile'>('requests');
  const [requestFilter, setRequestFilter] = useState<'all' | 'submitted' | 'accepted' | 'ready_for_pickup' | 'completed'>('all');
  
  // Selected store for dashboard (supports testing with multiple stores)
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    currentRetailerStore?.id || 'store_gupta_kirana'
  );

  const activeStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  // Store's listings
  const listings = storeListings.filter(l => l.storeId === activeStore.id);

  // Store's purchase requests
  const storeRequests = purchaseRequests.filter(r => r.storeId === activeStore.id);

  const filteredRequests = storeRequests.filter(r => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  // Analytics
  const completedRequests = storeRequests.filter(r => r.status === 'completed');
  const totalSales = completedRequests.reduce((sum, r) => sum + r.totalAmount, 0);
  const pendingRequestsCount = storeRequests.filter(r => r.status === 'submitted').length;

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedExistingProdId, setSelectedExistingProdId] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<number>(100);
  const [newProdStock, setNewProdStock] = useState<StockStatus>('in_stock');
  const [newProdNotes, setNewProdNotes] = useState<string>('');

  // Custom Product Creation Form inside modal
  const [isCreatingCustomProduct, setIsCreatingCustomProduct] = useState(false);
  const [customProdName, setCustomProdName] = useState('');
  const [customProdBrand, setCustomProdBrand] = useState('');
  const [customProdCategory, setCustomProdCategory] = useState('groceries');
  const [customProdUnit, setCustomProdUnit] = useState('1 Pack');
  const [customProdMrp, setCustomProdMrp] = useState(120);
  const [customProdDesc, setCustomProdDesc] = useState('');

  // Store Profile Editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(activeStore.name);
  const [profileHours, setProfileHours] = useState(activeStore.openingHours);
  const [profilePhone, setProfilePhone] = useState(activeStore.phone);
  const [profileAddress, setProfileAddress] = useState(activeStore.fullAddress);
  const [profileDesc, setProfileDesc] = useState(activeStore.description);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile(activeStore.id, {
      name: profileName,
      openingHours: profileHours,
      phone: profilePhone,
      fullAddress: profileAddress,
      description: profileDesc,
    });
    setIsEditingProfile(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingCustomProduct) {
      if (!customProdName.trim()) return;
      addNewProductAndList(
        {
          name: customProdName.trim(),
          brand: customProdBrand.trim() || activeStore.name,
          category: customProdCategory,
          unit: customProdUnit,
          mrp: Number(customProdMrp) || Number(newProdPrice),
          description: customProdDesc.trim() || 'Locally sourced product available at store.',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        },
        activeStore.id,
        Number(newProdPrice),
        newProdStock
      );
    } else {
      if (!selectedExistingProdId) return;
      addStoreListing(
        activeStore.id,
        selectedExistingProdId,
        Number(newProdPrice),
        newProdStock,
        newProdNotes
      );
    }

    setIsAddProductOpen(false);
    setSelectedExistingProdId('');
    setIsCreatingCustomProduct(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Store Header & Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <span>Retailer Hub</span>
            <span aria-hidden="true">·</span>
            <span>{activeStore.locality}, Dehradun</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {activeStore.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Proprietor: <strong className="text-slate-800">{activeStore.ownerName}</strong> · Phone: {activeStore.phone} · Hours: {activeStore.openingHours}
          </p>
        </div>

        {/* Store Selector for Demo Convenience */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="text-xs text-slate-500">
            <span>Manage Store:</span>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="ml-1.5 p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
            >
              {stores.filter(s => s.status === 'active').map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.locality})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add / List Product</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Listed Products</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{listings.length}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Active in Local Catalog</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Pending Requests</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingRequestsCount}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">Awaiting Acceptance</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Completed Orders</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{completedRequests.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Physical Counter Pickups</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Fulfilled GMV</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalSales}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Paid Directly at Store</div>
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
          Customer Requests ({storeRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'products'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Manage Product Inventory ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'profile'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Store Settings & Profile
        </button>
      </div>

      {/* TAB 1: CUSTOMER REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Request Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['all', 'submitted', 'accepted', 'ready_for_pickup', 'completed'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setRequestFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                  requestFilter === filter
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              No customer requests found under "{requestFilter}".
            </div>
          ) : (
            filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {request.referenceNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500">{request.createdAt}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 mt-1">
                      Customer: {request.customerName} ({request.customerPhone})
                    </h3>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      request.status === 'submitted'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : request.status === 'ready_for_pickup'
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : request.status === 'completed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Items in Request */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg text-xs">
                  {request.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.productName}</span>
                        <span className="text-slate-500">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.total}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Order Total:</span>
                    <span className="text-sm text-emerald-900">₹{request.totalAmount}</span>
                  </div>
                </div>

                {/* Pickup details */}
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded">
                  <div>
                    <strong>Requested Pickup Time:</strong> {request.preferredPickupTime || 'Within 2 Hours'}
                  </div>
                  {request.pickupNotes && (
                    <div className="mt-0.5 text-slate-700">
                      <strong>Customer Note:</strong> "{request.pickupNotes}"
                    </div>
                  )}
                  {request.retailerRemarks && (
                    <div className="mt-0.5 text-emerald-800 font-medium">
                      <strong>Your Remark:</strong> "{request.retailerRemarks}"
                    </div>
                  )}
                </div>

                {/* Actions Bar for Retailer */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {request.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'accepted', 'Items confirmed in rack. Packing now.')}
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'cancelled', 'Item out of stock at store')}
                        className="px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === 'accepted' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'ready_for_pickup', 'Packed in bag with bill at counter')}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}

                  {request.status === 'ready_for_pickup' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'completed', 'Customer picked up at store counter')}
                      className="px-4 py-1.5 bg-emerald-900 hover:bg-black text-white rounded-lg text-xs font-bold"
                    >
                      Complete & Collect Payment (₹{request.totalAmount})
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MANAGE PRODUCTS & PRICING */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Manual Product Listings for {activeStore.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Small business friendly: no complex POS barcodes. Simply toggle stock status or adjust your prices anytime.
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
            {listings.map(listing => {
              const product = products.find(p => p.id === listing.productId);
              if (!product) return null;

              return (
                <div key={listing.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-contain rounded bg-slate-50 p-1 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {product.brand} · {product.unit} · MRP ₹{product.mrp}
                      </p>
                      {listing.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          "{listing.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Price Input */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Price: ₹</span>
                      <input
                        type="number"
                        value={listing.price}
                        onChange={(e) => updateStoreListing(listing.id, { price: Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded focus:bg-white"
                      />
                    </div>

                    {/* Stock Status Selector */}
                    <select
                      value={listing.stockStatus}
                      onChange={(e) => updateStoreListing(listing.id, { stockStatus: e.target.value as StockStatus })}
                      className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-hidden cursor-pointer ${
                        listing.stockStatus === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : listing.stockStatus === 'limited'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="limited">Limited</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STORE PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Store Profile Information</h3>
              <p className="text-xs text-slate-500">Edit business details visible to Dehradun customers</p>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profileHours}
                    onChange={(e) => setProfileHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="e.g. 08:00 AM - 09:30 PM"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Physical Address</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  Save Store Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Store Name</span>
                <span className="col-span-2 font-bold text-slate-900">{activeStore.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Locality</span>
                <span className="col-span-2 text-slate-800">{activeStore.locality}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Physical Address</span>
                <span className="col-span-2 text-slate-800">{activeStore.fullAddress}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Operating Hours</span>
                <span className="col-span-2 text-slate-800">{activeStore.openingHours}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Contact</span>
                <span className="col-span-2 text-slate-800">{activeStore.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <span className="font-semibold text-slate-500">Description</span>
                <span className="col-span-2 text-slate-800">{activeStore.description}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                List Product in {activeStore.name}
              </h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Toggle between existing master product or new custom product */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsCreatingCustomProduct(false)}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                  !isCreatingCustomProduct ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Select from Master Catalog
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingCustomProduct(true)}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                  isCreatingCustomProduct ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                + Add Custom New Product
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              {!isCreatingCustomProduct ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Choose Product
                  </label>
                  <select
                    value={selectedExistingProdId}
                    onChange={(e) => {
                      setSelectedExistingProdId(e.target.value);
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) setNewProdPrice(prod.mrp);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    required
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) - MRP ₹{p.mrp}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={customProdName}
                      onChange={(e) => setCustomProdName(e.target.value)}
                      placeholder="e.g. Apsara Platinum Pencil Box (10 pcs)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={customProdBrand}
                        onChange={(e) => setCustomProdBrand(e.target.value)}
                        placeholder="e.g. Apsara"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        value={customProdCategory}
                        onChange={(e) => setCustomProdCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Unit / Pack Size</label>
                      <input
                        type="text"
                        value={customProdUnit}
                        onChange={(e) => setCustomProdUnit(e.target.value)}
                        placeholder="e.g. 1 Box (10 Pcs)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        value={customProdMrp}
                        onChange={(e) => setCustomProdMrp(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Stock Status
                  </label>
                  <select
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value as StockStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Optional Note (e.g. Student discount on 2+)
                </label>
                <input
                  type="text"
                  value={newProdNotes}
                  onChange={(e) => setNewProdNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="e.g. Fresh stock, expiry 2027"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900"
                >
                  List Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
