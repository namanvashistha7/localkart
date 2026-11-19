import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, RotateCcw, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, switchRole, resetToDefaultData, setSelectedLocality } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-16">
      {/* Top Banner */}
      <div className="bg-emerald-900/60 border-b border-emerald-800/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-medium">Dehradun Hyperlocal Pilot Active</span>
            <span className="text-emerald-300/80 hidden md:inline">· Connecting students and residents to 15+ neighbourhood shops</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('retailer_registration')}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-3 py-1 rounded transition-colors"
            >
              Are you a local shopkeeper? List Free
            </button>
            <button
              onClick={resetToDefaultData}
              title="Reset sample data to fresh state"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                LK
              </div>
              <span className="text-base font-bold text-white tracking-tight">LocalKart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              “Your Neighbourhood. Your Stores. One Kart.”
              <br />
              Digital local-shopping and product-discovery marketplace for Dehradun, Uttarakhand. 
              Find nearby items, compare local store prices, and submit pickup requests without walking between shops physically.
            </p>
            <div className="pt-2 text-slate-400 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Karanpur & Premnagar Hubs, Dehradun, Uttarakhand 248001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>+91 98970 00001 (Mon-Sat 9am - 8pm IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>support@localkart-ddn.in</span>
              </div>
            </div>
          </div>

          {/* Dehradun Localities */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Dehradun Localities
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {['Karanpur', 'Premnagar', 'Rajpur Road', 'Jakhan', 'Paltan Bazaar', 'Clement Town', 'Ballupur'].map((loc) => (
                <li key={loc}>
                  <button
                    onClick={() => {
                      setSelectedLocality(loc);
                      navigateTo('discovery');
                    }}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {loc}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Platform Pages
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('discovery')} className="hover:text-white transition-colors">
                  Product Discovery
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('store_directory')} className="hover:text-white transition-colors">
                  Local Store Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('retailer_registration')} className="hover:text-white transition-colors">
                  Retailer Onboarding
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  About LocalKart
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('help')} className="hover:text-white transition-colors">
                  Help & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('auth')} className="hover:text-emerald-400 text-emerald-300 transition-colors">
                  Google Login / Account
                </button>
              </li>
            </ul>
          </div>

          {/* Demo Roles & Venture Quest */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              DGU Venture Quest
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    switchRole('founder');
                    navigateTo('founder_workspace');
                  }}
                  className="hover:text-emerald-400 font-medium text-emerald-300 transition-colors flex items-center gap-1"
                >
                  Validation Workspace
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('admin');
                    navigateTo('admin_dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Admin Operations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('retailer');
                    navigateTo('retailer_dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Retailer Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('customer');
                    navigateTo('customer_dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Student Orders
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © 2026 LocalKart Technologies (Dehradun, Uttarakhand). Conceived for DGU Venture Quest.
          </div>
          <div>
            Designed with Zero-Pill typography & responsive retail architecture.
          </div>
        </div>
      </div>
    </footer>
  );
};
