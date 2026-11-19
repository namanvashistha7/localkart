import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  MapPin,
  Phone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User as UserIcon,
  Store as StoreIcon,
  Loader2,
} from 'lucide-react';

const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

export const AuthPage: React.FC = () => {
  const {
    firebaseUser,
    isAuthReady,
    authLoading,
    authError,
    clearAuthError,
    signInWithGoogle,
    signOutGoogle,
    currentUser,
    updateMyGoogleProfile,
    localities,
    navigateTo,
    setSelectedLocality,
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [locality, setLocality] = useState(currentUser.locality || 'Karanpur');
  const [accountRole, setAccountRole] = useState<'customer' | 'retailer'>(
    currentUser.role === 'retailer' ? 'retailer' : 'customer'
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (currentUser.isGoogleSignedIn) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      setLocality(currentUser.locality || 'Karanpur');
      setAccountRole(currentUser.role === 'retailer' ? 'retailer' : 'customer');
    }
  }, [currentUser]);

  const handleGoogleSignIn = async () => {
    clearAuthError();
    await signInWithGoogle();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setProfileSaved(false);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setFormError('Please enter your full name (1-100 characters).');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone && cleanPhone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setProfileSaving(true);
    try {
      await updateMyGoogleProfile({
        name: trimmedName,
        phone: cleanPhone,
        locality,
        role: accountRole,
      });
      setSelectedLocality(locality);
      setProfileSaved(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not update profile. Please try again.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
        <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-600 font-medium">Checking Google session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {!firebaseUser ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-2 text-center max-w-lg mx-auto">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              LocalKart Account Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Sign in with your Gmail / Google Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use your Google account to save Dehradun favourite stores, submit verified pickup requests, and keep your shopping history synced securely.
            </p>
          </div>

          {authError && (
            <div className="max-w-md mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="max-w-sm mx-auto space-y-4 pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full py-3 px-5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs flex items-center justify-center gap-3 text-sm font-bold text-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <GoogleGIcon className="w-5 h-5" />
              )}
              <span>{authLoading ? 'Signing in...' : 'Continue with Google (Gmail)'}</span>
            </button>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              Supports personal <strong>@gmail.com</strong> and college Google Workspace accounts (e.g. Graphic Era / UPES).
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Identity</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Retailers trust pickup reservations backed by your verified Google email.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Locality Remembered</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Save your Karanpur, Premnagar, or Rajpur Road area for instant search.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Zero Extra Passwords</span>
              </div>
              <p className="text-[11px] text-slate-500">
                No forgotten passwords—sign in and recover access anytime via Google.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Signed In Account Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Google Profile'}
                  className="w-14 h-14 rounded-full border-2 border-emerald-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xl">
                  {(firebaseUser.displayName || firebaseUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Signed in via Google</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                  {currentUser.name || firebaseUser.displayName}
                </h1>
                <p className="text-xs text-slate-500">{firebaseUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOutGoogle}
              className="self-start sm:self-auto px-3.5 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Profile Preferences Form (Synced to Firestore) */}
          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Complete Your Dehradun Profile
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Saved securely to your LocalKart account so stores can confirm your pickup requests.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Your Google account profile has been saved!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp / Mobile Number (India)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                    placeholder="+91 98765 XXXXX"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Primary Dehradun Locality *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                >
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.areaType === 'campus' ? 'Campus Area' : loc.areaType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountRole('customer')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      accountRole === 'customer'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Shopper</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountRole('retailer')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      accountRole === 'retailer'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <StoreIcon className="w-3.5 h-3.5" />
                    <span>Retailer</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('discovery')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
                >
                  Explore Products
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigateTo(accountRole === 'retailer' ? 'retailer_dashboard' : 'customer_dashboard')
                  }
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors shadow-xs disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
