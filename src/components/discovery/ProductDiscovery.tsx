import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductDetailsModal } from './ProductDetailsModal';
import {
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  Store as StoreIcon,
  X,
  Bookmark,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const ProductDiscovery: React.FC = () => {
  const {
    products,
    stores,
    storeListings,
    selectedLocality,
    setSelectedLocality,
    localities,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    savedProductIds,
    toggleSaveProduct,
    viewParam,
    navigateTo,
  } = useApp();

  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'store_count' | 'name'>('price_asc');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [recentSuccessRef, setRecentSuccessRef] = useState<string | null>(null);

  // Check if viewParam passed a specific product to inspect
  useEffect(() => {
    if (viewParam?.selectedProductId) {
      const match = products.find(p => p.id === viewParam.selectedProductId);
      if (match) setSelectedProductForModal(match);
    }
  }, [viewParam, products]);

  // Filter products based on search, category, locality, and stock
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc && !matchCat) return false;
    }

    // 2. Category Filter
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    // 3. Locality Filter (Does any store in this locality list it?)
    const listings = storeListings.filter(l => l.productId === product.id);
    if (selectedLocality !== 'All') {
      const storesInLocality = stores.filter(s => s.locality === selectedLocality).map(s => s.id);
      const hasInLocality = listings.some(l => storesInLocality.includes(l.storeId));
      if (!hasInLocality) return false;
    }

    // 4. In Stock Only
    if (inStockOnly) {
      const hasInStock = listings.some(l => l.stockStatus !== 'out_of_stock');
      if (!hasInStock) return false;
    }

    return true;
  });

  // Calculate pricing & store stats for each product
  const productsWithStats = filteredProducts.map(product => {
    const listings = storeListings.filter(l => l.productId === product.id);
    const validListings = listings.filter(l => l.stockStatus !== 'out_of_stock');
    const minPrice = validListings.length > 0
      ? Math.min(...validListings.map(l => l.price))
      : (listings.length > 0 ? Math.min(...listings.map(l => l.price)) : product.mrp);

    // List of store localities where it is available
    const availableLocalities = Array.from(
      new Set(
        listings
          .map(l => stores.find(s => s.id === l.storeId)?.locality)
          .filter((loc): loc is string => loc !== undefined)
      )
    );

    return {
      product,
      listingsCount: listings.length,
      inStockStoresCount: validListings.length,
      minPrice,
      availableLocalities,
    };
  });

  // Sort products
  productsWithStats.sort((a, b) => {
    if (sortBy === 'price_asc') return a.minPrice - b.minPrice;
    if (sortBy === 'price_desc') return b.minPrice - a.minPrice;
    if (sortBy === 'store_count') return b.inStockStoresCount - a.inStockStoresCount;
    return a.product.name.localeCompare(b.product.name);
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedLocality('All');
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Success Banner if reservation placed */}
      {recentSuccessRef && (
        <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-emerald-700 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold">Purchase Request Submitted Successfully!</p>
              <p className="text-[11px] text-emerald-200">
                Ref No: <span className="font-mono font-semibold text-white">{recentSuccessRef}</span>. The store has been notified to hold your items.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('customer_dashboard')}
              className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-950 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              View in My Orders
            </button>
            <button
              onClick={() => setRecentSuccessRef(null)}
              className="p-1.5 text-emerald-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Local Discovery & Comparison
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Find Products in Dehradun Stores
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare prices, check live availability, and reserve for pickup across neighbourhood retailers.
          </p>
        </div>

        {/* Active Locality Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-slate-500">Searching in:</span>
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
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

      {/* Filter Bar: Category Tabs & Search Inputs */}
      <div className="space-y-3">
        {/* Search input + Controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, brand, or item..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 select-none shrink-0">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-emerald-700 w-3.5 h-3.5 rounded"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="store_count">Most Stores Stocking</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Clean Segmented Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
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

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory || selectedLocality !== 'All' || inStockOnly) && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">Active Filters:</span>
            {searchQuery && (
              <span>Search: "{searchQuery}"</span>
            )}
            {selectedCategory && (
              <span>Category: {categories.find(c => c.id === selectedCategory)?.name}</span>
            )}
            {selectedLocality !== 'All' && (
              <span>Locality: {selectedLocality}</span>
            )}
            {inStockOnly && (
              <span>In Stock Only</span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            className="text-emerald-800 hover:underline font-semibold text-[11px]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing {productsWithStats.length} products available across local retailers
      </div>

      {/* Product Cards Grid */}
      {productsWithStats.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No matching products found
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              We couldn't find any products matching your current search or locality filter in Dehradun. 
              Try searching with broader terms or view stores across All Dehradun.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setSelectedLocality('All')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Search All Dehradun
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {productsWithStats.map(({ product, listingsCount, inStockStoresCount, minPrice, availableLocalities }) => {
            const isSaved = savedProductIds.includes(product.id);
            const savings = product.mrp > minPrice ? product.mrp - minPrice : 0;

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                {/* Product Image Box */}
                <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <button
                    onClick={() => toggleSaveProduct(product.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs hover:bg-white text-slate-500 transition-colors"
                    title={isSaved ? 'Remove from saved' : 'Save product'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Brand & Unit */}
                    <div className="text-[11px] text-slate-500 font-medium">
                      <span>{product.brand}</span>
                      <span className="mx-1">·</span>
                      <span>{product.unit}</span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors">
                      {product.name}
                    </h3>

                    {/* Local Availability */}
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <StoreIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        In stock at <strong className="text-slate-800">{inStockStoresCount}</strong> local {inStockStoresCount === 1 ? 'store' : 'stores'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 mr-1">Starts at</span>
                        <span className="text-base font-bold text-emerald-950">
                          ₹{minPrice}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Save ₹{savings}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedProductForModal(product)}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Compare {listingsCount} Stores</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Store Comparison Modal */}
      {selectedProductForModal && (
        <ProductDetailsModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onRequestSubmitted={(refNum) => {
            setRecentSuccessRef(refNum);
          }}
        />
      )}
    </div>
  );
};
