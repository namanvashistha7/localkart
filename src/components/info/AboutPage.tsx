import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  CheckCircle2,
  Store as StoreIcon,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          The Story Behind LocalKart
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Empowering Dehradun's Neighbourhood Stores & University Students
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          LocalKart was conceived as a digital local-shopping and product-discovery marketplace for Dehradun, Uttarakhand, for the DGU Venture Quest venture validation experiment.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* The Problem */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            The Problem We Witnessed in Dehradun
          </h2>
          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
              <span>
                <strong>Frustrating Multi-Shop Searches:</strong> Over 50,000 university students (Graphic Era, UPES, DIT, DAV) frequently walk or drive to 3-4 different shops along Premnagar or Karanpur just to find a specific engineering register, exam calculator, or personal care item.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
              <span>
                <strong>High App Markups & Delivery Fees:</strong> Quick-commerce apps inflate product prices by 15-30% and add high delivery charges, while independent local kiranas sell the exact same items at fair local rates.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
              <span>
                <strong>Digitally Left-Behind Retailers:</strong> Small family-owned shops lack complex POS hardware and cannot afford expensive ERP setups, losing walk-in customers despite having full inventory in stock.
              </span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="bg-white border border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs bg-emerald-50/20">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            The LocalKart Solution
          </h2>
          <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Hyperlocal Search & Price Comparison:</strong> Students and residents search once and see live prices and stock levels across every nearby store in Karanpur, Premnagar, Rajpur Road, and beyond.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Friction Reservation:</strong> Submit a 1-tap purchase request. The storekeeper packs it at the counter. The customer walks in and collects in 2 minutes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Small Business Friendly:</strong> No barcodes, POS terminals, or automated inventory sync needed. Retailers update prices and availability from their mobile phone in seconds.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-slate-900 text-center">
          Our Three Guiding Commitments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm">1. Community First</div>
            <p className="leading-relaxed">
              Every transaction made on LocalKart keeps money circulating within Dehradun's local neighbourhood economy and supports family-run stores.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm">2. Radical Simplicity</div>
            <p className="leading-relaxed">
              We design tools that small shopkeepers can use effortlessly without taking time away from serving customers at the billing counter.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm">3. Transparent Unit Economics</div>
            <p className="leading-relaxed">
              A sustainable 10% commission model that delivers measurable value to both merchants and students without predatory burn subsidies.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-900">
          Ready to experience neighbourhood shopping?
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('discovery')}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Explore Dehradun Stores
          </button>
          <button
            onClick={() => navigateTo('retailer_registration')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
          >
            Register a Store
          </button>
        </div>
      </div>
    </div>
  );
};
