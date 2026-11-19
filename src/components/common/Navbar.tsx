import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Store,
  MapPin,
  Search,
  Bookmark,
  FileText,
  User,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Info,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  LogIn,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    firebaseUser,
    signInWithGoogle,
    signOutGoogle,
    authLoading,
    currentUser,
    switchRole,
    selectedLocality,
    setSelectedLocality,
    localities,
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery,
    addRecentSearch,
    purchaseRequests,
    savedStoreIds,
    savedProductIds,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);

  const activeCustomerRequests = purchaseRequests.filter(
    r => r.customerId === currentUser.id && r.status !== 'completed' && r.status !== 'cancelled'
  );

  const pendingRetailerRequests = purchaseRequests.filter(
    r => r.storeId === (currentUser.associatedStoreId || 'store_gupta_kirana') && r.status === 'submitted'
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchInput.trim()) {
      setSearchQuery(localSearchInput.trim());
      addRecentSearch(localSearchInput.trim());
      navigateTo('discovery');
    }
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; desc: string }> = {
    customer: { label: 'Customer / Student', badge: 'Shopper View', desc: 'Graphic Era Student' },
    retailer: { label: 'Local Retailer', badge: 'Store Owner', desc: 'Gupta Kirana & Stationers' },
    admin: { label: 'Platform Admin', badge: 'Supervisor', desc: 'Dehradun Ops & Approvals' },
    founder: { label: 'Founder & Venture', badge: 'DGU Quest', desc: '30-Day Validation Tracker' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Demo Bar for Easy Evaluation */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">LocalKart Demo Portal:</span>
            <span className="text-emerald-300 hidden sm:inline">Switch role anytime to test workflows</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 text-[11px] mr-1 hidden md:inline">Quick Role Switch:</span>
            {(['customer', 'retailer', 'admin', 'founder'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  setRoleDropdownOpen(false);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  currentUser.role === role
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-300 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                {role === 'customer' && 'Student'}
                {role === 'retailer' && 'Retailer'}
                {role === 'admin' && 'Admin'}
                {role === 'founder' && 'Founder (Venture)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-emerald-900 transition-colors">
                LK
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  LocalKart
                </span>
                <span className="text-[10px] text-emerald-800 font-medium tracking-wide uppercase block -mt-0.5">
                  Dehradun Local Mart
                </span>
              </div>
            </button>

            {/* Locality Selector Dropdown */}
            <div className="hidden lg:flex items-center pl-3 border-l border-slate-200 ml-2">
              <div className="flex items-center text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1.5 shrink-0" />
                <span className="text-slate-500 mr-1">Area:</span>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Dehradun</option>
                  {localities.map(loc => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.areaType === 'campus' ? 'Campus Area' : loc.areaType})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Bar in Header */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                placeholder="Search notebooks, Maggi, shampoo, cables..."
                className="w-full pl-9 pr-20 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white rounded font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => navigateTo('discovery')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'discovery'
                  ? 'text-emerald-900 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Discover
            </button>

            <button
              onClick={() => navigateTo('store_directory')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'store_directory' || currentView === 'store_profile'
                  ? 'text-emerald-900 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Stores
            </button>

            {/* Role-Specific Direct Links */}
            {currentUser.role === 'customer' && (
              <button
                onClick={() => navigateTo('customer_dashboard')}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === 'customer_dashboard'
                    ? 'text-emerald-900 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Orders
                {activeCustomerRequests.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-emerald-700 rounded-full">
                    {activeCustomerRequests.length}
                  </span>
                )}
              </button>
            )}

            {currentUser.role === 'retailer' && (
              <button
                onClick={() => navigateTo('retailer_dashboard')}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === 'retailer_dashboard'
                    ? 'text-emerald-900 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Store Dashboard
                {pendingRetailerRequests.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-600 rounded-full">
                    {pendingRetailerRequests.length}
                  </span>
                )}
              </button>
            )}

            {currentUser.role === 'admin' && (
              <button
                onClick={() => navigateTo('admin_dashboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === 'admin_dashboard'
                    ? 'text-emerald-900 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Admin Panel
              </button>
            )}

            {currentUser.role === 'founder' && (
              <button
                onClick={() => navigateTo('founder_workspace')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === 'founder_workspace'
                    ? 'text-emerald-900 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Venture Workspace
              </button>
            )}

            {/* Quick Onboard Retailer button */}
            <button
              onClick={() => navigateTo('retailer_registration')}
              className="text-xs text-slate-500 hover:text-emerald-800 px-2 py-1 transition-colors"
              title="Register a neighbourhood store"
            >
              + Join as Store
            </button>
          </nav>

          {/* User Account / Google Login & Role Badge */}
          <div className="flex items-center gap-2">
            {!firebaseUser && (
              <button
                onClick={() => navigateTo('auth')}
                disabled={authLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign in with Google</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 text-left rounded-md hover:bg-slate-100 transition-colors border border-slate-200"
              >
                {firebaseUser && currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden xl:block">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {firebaseUser ? 'Google Verified' : roleLabels[currentUser.role].badge}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      Location: {currentUser.locality}
                    </p>
                  </div>

                  {/* Google Account Actions */}
                  <div className="py-1 border-b border-slate-100">
                    {!firebaseUser ? (
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          signInWithGoogle();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Sign in with Google (Gmail)</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigateTo('auth');
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          <span>My Google Account</span>
                        </button>
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            signOutGoogle();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Test Persona
                    </div>
                    {(['customer', 'retailer', 'admin', 'founder'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          switchRole(role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          currentUser.role === role
                            ? 'bg-emerald-50 text-emerald-900 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div>{roleLabels[role].label}</div>
                          <div className="text-[10px] text-slate-400">{roleLabels[role].desc}</div>
                        </div>
                        {currentUser.role === role && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        navigateTo('about');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      About LocalKart
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('help');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Help & FAQs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {/* Locality Selector Mobile */}
          <div className="flex items-center text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <MapPin className="w-4 h-4 text-emerald-700 mr-2 shrink-0" />
            <span className="text-slate-500 mr-1">Area:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden w-full"
            >
              <option value="All">All Dehradun</option>
              {localities.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }}>
            <div className="relative">
              <input
                type="text"
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                placeholder="Search products in Dehradun..."
                className="w-full pl-9 pr-16 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 text-xs bg-emerald-800 text-white rounded font-medium"
              >
                Go
              </button>
            </div>
          </form>

          {/* Mobile Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => { navigateTo('landing'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded"
            >
              Home
            </button>
            <button
              onClick={() => { navigateTo('discovery'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded"
            >
              Discover Products
            </button>
            <button
              onClick={() => { navigateTo('store_directory'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded"
            >
              Local Stores
            </button>
            <button
              onClick={() => { navigateTo('retailer_registration'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded font-semibold"
            >
              + Register Store
            </button>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Dashboard
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { switchRole('customer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${currentUser.role === 'customer' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Student Orders
              </button>
              <button
                onClick={() => { switchRole('retailer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${currentUser.role === 'retailer' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Retailer Hub
              </button>
              <button
                onClick={() => { switchRole('admin'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${currentUser.role === 'admin' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Admin Ops
              </button>
              <button
                onClick={() => { switchRole('founder'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${currentUser.role === 'founder' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Founder Workspace
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2">
            {!firebaseUser ? (
              <button
                onClick={() => { navigateTo('auth'); setMobileMenuOpen(false); }}
                className="w-full py-2 px-3 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google (Gmail)</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => { navigateTo('auth'); setMobileMenuOpen(false); }}
                  className="text-xs font-semibold text-emerald-900 truncate"
                >
                  {firebaseUser.email}
                </button>
                <button
                  onClick={() => { signOutGoogle(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-semibold shrink-0"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
