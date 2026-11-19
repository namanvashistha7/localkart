import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store as StoreIcon,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  FileText,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const RetailerRegistration: React.FC = () => {
  const {
    localities,
    categories,
    registerNewStore,
    switchRole,
    navigateTo,
  } = useApp();

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [locality, setLocality] = useState(localities[0]?.name || 'Karanpur');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [openingHours, setOpeningHours] = useState('08:30 AM - 09:30 PM');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['groceries']);
  const [description, setDescription] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');

  const [submittedStoreId, setSubmittedStoreId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleToggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim()) {
      setError('Please provide store name and owner name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one product category.');
      return;
    }

    const newId = registerNewStore({
      name: storeName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      locality,
      fullAddress: fullAddress.trim() || `${storeName}, ${locality}, Dehradun`,
      landmark: landmark.trim() || 'Near Main Chowk',
      pincode: '248001',
      openingHours,
      categories: selectedCategories,
      description: description.trim() || 'Neighbourhood shop serving local Dehradun community and college students.',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    });

    setSubmittedStoreId(newId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {submittedStoreId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center max-w-xl mx-auto space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              Application Submitted
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Welcome to LocalKart, {ownerName}!
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your store <strong>{storeName}</strong> ({locality}) has been registered and placed in the Admin Verification queue.
              In this demo prototype, you can inspect it in the Admin Dashboard or jump directly into your Retailer Hub.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5 text-left">
            <div><strong>Store ID:</strong> {submittedStoreId}</div>
            <div><strong>Locality:</strong> {locality}, Dehradun</div>
            <div><strong>Status:</strong> <span className="text-amber-700 font-bold">Pending Admin Approval</span></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                switchRole('retailer');
                navigateTo('retailer_dashboard');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Open Retailer Dashboard
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                navigateTo('admin_dashboard');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors"
            >
              Review in Admin Queue
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Neighbourhood Merchant Onboarding
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
              Register Your Dehradun Store on LocalKart
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Zero software cost · No POS integration needed · Connect with university students & local families
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Step 1: Store Basics */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Basic Business Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store / Shop Name *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Doon Stationery & Xerox Point"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Proprietor / Owner Name *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Mobile Number (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98971 XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Locality in Dehradun *
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-700"
                  >
                    {localities.map(loc => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.areaType === 'campus' ? 'Campus Area' : loc.areaType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Location & Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Location & Shop Timings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Physical Address *
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="Shop No., Main Market Road, Dehradun"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nearest Landmark / College Gate
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Graphic Era Gate 2 / Survey Chowk"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operating Hours *
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="08:30 AM - 09:30 PM"
                  className="w-full sm:w-72 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Step 3: Product Categories */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Categories You Sell (Select all that apply)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map(cat => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs">{cat.name}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Verification & Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Verification & Store Bio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN or Trade Registration (Optional for Kiranas)
                  </label>
                  <input
                    type="text"
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                    placeholder="e.g. 05AAAAA0000A1Z5 or Municipal Shop Act ID"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brief Store Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your specialties, e.g. student discounts, organic local grains, wholesale prices..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                By submitting, you agree to LocalKart's fair pricing policy and honest stock reporting.
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Submit Merchant Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
