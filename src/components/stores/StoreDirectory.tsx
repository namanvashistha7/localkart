import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store as StoreIcon,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const StoreDirectory: React.FC = () => {
  const {
    stores,
    storeListings,
    selectedLocality,
    setSelectedLocality,
    localities,
    categories,
    navigateTo,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [storeSearch, setStoreSearch] = useState('');

  const activeStores = stores.filter(s => s.status === 'active');

  const filteredStores = activeStores.filter(store => {
    // Locality
    if (selectedLocality !== 'All' && store.locality !== selectedLocality) {
      return false;
    }
    // Category
    if (categoryFilter && !store.categories.includes(categoryFilter)) {
      return false;
    }
    // Search
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      const matchName = store.name.toLowerCase().includes(q);
      const matchOwner = store.ownerName.toLowerCase().includes(q);
      const matchLoc = store.locality.toLowerCase().includes(q);
      const matchAddr = store.fullAddress.toLowerCase().includes(q);
      if (!matchName && !matchOwner && !matchLoc && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Independent Retail Network
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dehradun Neighbourhood Stores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified kirana stores, stationery shops, cosmetic centers, and tech hubs in your local area.
          </p>
        </div>

        <button
          onClick={() => navigateTo('retailer_registration')}
          className="self-start md:self-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <span>+ Register Your Store</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Store Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Search store name, locality, or landmark in Dehradun..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Locality Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-slate-500">Area:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Dehradun</option>
              {localities.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              categoryFilter === null
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Shop Types ({activeStores.length})
          </button>
          {categories.map(cat => {
            const count = activeStores.filter(s => s.categories.includes(cat.id)).length;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(isSelected ? null : cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <StoreIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No stores found matching criteria
          </h3>
          <p className="text-xs text-slate-500">
            Try switching your locality to "All Dehradun" or reset category filters.
          </p>
          <button
            onClick={() => { setSelectedLocality('All'); setCategoryFilter(null); setStoreSearch(''); }}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map(store => {
            const listings = storeListings.filter(l => l.storeId === store.id);
            return (
              <div
                key={store.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Store Cover Image */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                    {store.verified && (
                      <div className="absolute top-2.5 left-2.5 bg-emerald-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Merchant
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-900">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          {store.locality}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {store.rating} ({store.reviewCount})
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {store.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Proprietor: <span className="font-medium text-slate-700">{store.ownerName}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {store.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{store.fullAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{store.openingHours}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <div className="bg-slate-50 rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Listed Products:</span>
                    <span className="font-bold text-slate-900">{listings.length} items</span>
                  </div>

                  <button
                    onClick={() => navigateTo('store_profile', store.id)}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View Store Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
