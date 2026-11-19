import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  MapPin,
  Store as StoreIcon,
  ShoppingBag,
  BookOpen,
  Sparkles,
  Home,
  Smartphone,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    selectedLocality,
    setSelectedLocality,
    localities,
    categories,
    stores,
    products,
    storeListings,
    navigateTo,
    setSearchQuery,
    setSelectedCategory,
    addRecentSearch,
    toggleSaveStore,
    savedStoreIds,
  } = useApp();

  const [heroSearchInput, setHeroSearchInput] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      setSearchQuery(heroSearchInput.trim());
      addRecentSearch(heroSearchInput.trim());
      navigateTo('discovery');
    } else {
      navigateTo('discovery');
    }
  };

  const handleQuickKeyword = (keyword: string) => {
    setSearchQuery(keyword);
    addRecentSearch(keyword);
    navigateTo('discovery');
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    navigateTo('discovery');
  };

  // Filter stores by selected locality if not 'All'
  const activeStores = stores.filter(s => s.status === 'active');
  const nearbyStores = selectedLocality === 'All'
    ? activeStores.slice(0, 4)
    : activeStores.filter(s => s.locality === selectedLocality).concat(
        activeStores.filter(s => s.locality !== selectedLocality)
      ).slice(0, 4);

  // Popular products with store pricing info
  const popularProducts = products.slice(0, 4).map(prod => {
    const listings = storeListings.filter(l => l.productId === prod.id && l.stockStatus !== 'out_of_stock');
    const minPrice = listings.length > 0 ? Math.min(...listings.map(l => l.price)) : prod.mrp;
    return {
      ...prod,
      availableStoresCount: listings.length,
      minPrice,
    };
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-emerald-700" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-700" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-700" />;
      case 'Home': return <Home className="w-5 h-5 text-emerald-700" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-emerald-700" />;
      default: return <Package className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Unboxed Kicker */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-widest">
            <span>Dehradun Hyperlocal Marketplace</span>
            <span aria-hidden="true">·</span>
            <span>Graphic Era / UPES / Karanpur / Rajpur Rd</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Neighbourhood. <br className="hidden sm:inline" />
            Your Stores. <span className="text-emerald-300">One Kart.</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Find nearby products, compare local prices and availability across independent shops, and reserve for pickup without visiting multiple stores physically.
          </p>

          {/* Prominent Search Bar with Locality Selector */}
          <div className="max-w-3xl mx-auto mt-6">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-xl shadow-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-emerald-700/50"
            >
              {/* Locality Selector */}
              <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 shrink-0 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-emerald-700 mr-2 shrink-0" />
                <span className="text-slate-500 mr-1 hidden sm:inline">Area:</span>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Dehradun</option>
                  {localities.map(loc => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  placeholder="What are you looking for today? (e.g. Classmate register, Maggi, Casio...)"
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Search Local Stores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Suggestions (clean unboxed links) */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200">
              <span className="text-emerald-300/80">Trending in Dehradun:</span>
              {['Classmate Spiral Notebook', 'Maggi 8-Pack', 'Casio FX-991CW', 'boAt Cable', 'A4 Paper'].map((tag, idx) => (
                <button
                  key={tag}
                  onClick={() => handleQuickKeyword(tag)}
                  className="text-white hover:text-emerald-300 underline underline-offset-4 transition-colors font-medium"
                >
                  {tag}{idx < 4 && <span className="text-emerald-400/60 no-underline ml-2">·</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Value Propositions Banner (Non-pill clean cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <StoreIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Discover Nearby Stores
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly find independent kirana shops, stationery stores, and local pharmacies within walking distance of your hostel, college, or home.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Compare Local Options
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare live prices and stock availability side-by-side across participating Dehradun retailers before you step out or pay high delivery markups.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-emerald-700/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Shop Conveniently
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a quick reservation request. The retailer packs your order, sends a ready ping, and you collect it in 2 minutes without waiting in queues.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Browse by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Explore everyday products available at independent Dehradun merchants</p>
          </div>
          <button
            onClick={() => { setSelectedCategory(null); navigateTo('discovery'); }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 mt-2 sm:mt-0 flex items-center gap-1"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(cat => {
            const prodCount = products.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-white border border-slate-200 hover:border-emerald-600 rounded-xl p-4 text-left transition-all hover:shadow-xs group flex flex-col justify-between"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors mb-3">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {prodCount} products listed
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Nearby Stores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 pb-2 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              {selectedLocality === 'All' ? 'Verified Partners in Dehradun' : `Active Stores in ${selectedLocality}`}
            </div>
            <h2 className="text-xl font-bold text-slate-900">Featured Neighbourhood Stores</h2>
          </div>
          <button
            onClick={() => navigateTo('store_directory')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 mt-2 sm:mt-0 flex items-center gap-1"
          >
            Browse all {activeStores.length} stores <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {nearbyStores.map(store => {
            const storeProducts = storeListings.filter(l => l.storeId === store.id);
            return (
              <div
                key={store.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Store Header Image */}
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  {store.verified && (
                    <div className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Local Partner
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        {store.locality}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {store.rating} ({store.reviewCount})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                      {store.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {store.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {store.openingHours}
                      </span>
                      <span>{storeProducts.length} items listed</span>
                    </div>

                    <button
                      onClick={() => navigateTo('store_profile', store.id)}
                      className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Store & Inventory</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Products with Price Comparison Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 pb-2 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              Top Student & Household Essentials
            </div>
            <h2 className="text-xl font-bold text-slate-900">Compare Prices Across Stores</h2>
          </div>
          <button
            onClick={() => navigateTo('discovery')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 mt-2 sm:mt-0 flex items-center gap-1"
          >
            Explore all products <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularProducts.map(prod => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-50 overflow-hidden p-4 flex items-center justify-center">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {prod.brand} · {prod.unit}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                    {prod.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-xs text-slate-400 mr-1">Starts at</span>
                      <span className="text-base font-bold text-emerald-900">
                        ₹{prod.minPrice}
                      </span>
                    </div>
                    {prod.mrp > prod.minPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{prod.mrp}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 mb-3 flex items-center gap-1.5">
                    <StoreIcon className="w-3 h-3 text-emerald-700" />
                    <span>In stock at {prod.availableStoresCount} local shops</span>
                  </div>

                  <button
                    onClick={() => navigateTo('discovery', { selectedProductId: prod.id })}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Compare Local Stores
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Market Context (College Campuses & Dehradun Community) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Target Market Focus · Dehradun, Uttarakhand
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-snug">
                Built specifically for college students & neighbourhood households in Dehradun
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                With 50,000+ students studying across Graphic Era, UPES, DIT, and DAV PG College, navigating congested Rajpur Road and Premnagar traffic just to check if a specific notebook, calculator, or hostel item is in stock wastes hours of study time.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Transparent local prices without 30-40% app markups</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Support independent local kiranas and family bookshops</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Same-day quick pickup ready within 1-2 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>No delivery wait or delivery fee needed</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">LocalKart Impact Snapshot</span>
                <span className="text-[11px] text-emerald-800 font-semibold">30-Day Validation Pilot</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">8+</div>
                  <div className="text-[11px] text-slate-500">Dehradun Localities</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">12+</div>
                  <div className="text-[11px] text-slate-500">Active Retailers</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">30 min</div>
                  <div className="text-[11px] text-slate-500">Avg. Time Saved</div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-950">
                <p className="font-semibold mb-1">Are you a shopkeeper in Karanpur, Premnagar, or Rajpur?</p>
                <p className="text-[11px] text-emerald-800">
                  Join without any setup fee or automated POS integration. Update prices anytime from your mobile.
                </p>
                <button
                  onClick={() => navigateTo('retailer_registration')}
                  className="mt-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                >
                  Register Your Store Free <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
