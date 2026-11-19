import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const { firebaseUser, submitSupportFeedback, navigateTo } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackCategory, setFeedbackCategory] = useState<'customer' | 'retailer' | 'general'>('customer');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: 'How does LocalKart work for students in Dehradun?',
      a: 'Search for any product (such as a spiral register, Maggi multipack, or Casio calculator). LocalKart immediately displays which neighbourhood shops in Premnagar, Karanpur, or Rajpur Road have it in stock and at what price. You can select your preferred store and click "Request Pickup". The store owner keeps it packed for you, and you pay directly when collecting.',
    },
    {
      q: 'Do I pay online or at the store counter?',
      a: 'In our 30-day MVP validation phase, you pay the storekeeper directly at the billing counter via UPI (Google Pay, PhonePe, Paytm) or Cash. There are no online payment gateway deductions, so local stores receive 100% of their selling price.',
    },
    {
      q: 'How does a local retailer manage their inventory without a barcode scanner?',
      a: 'LocalKart does not require complex automated POS integration. Retailers receive an ultra-simple mobile dashboard where they can change prices in one tap and toggle items between "In Stock", "Limited", or "Out of Stock" in 3 seconds.',
    },
    {
      q: 'What happens after I submit a purchase request?',
      a: 'The retailer receives the request with your name, phone number, and requested pickup window. They tap "Accept" and pack the item. When ready, the status updates to "Ready for Pickup", and you can walk into the store with your order reference number.',
    },
    {
      q: 'Which college campuses in Dehradun are covered initially?',
      a: 'Our initial launch focuses on Graphic Era University (Premnagar & Clement Town), UPES (Bidholi / Kandoli transit corridors), DAV PG College (Karanpur), DIT University (Jakhan corridor), and core residential hubs like Ballupur and Rajpur Road.',
    },
    {
      q: 'How does LocalKart generate revenue?',
      a: 'LocalKart proposes a simple 10% commission on completed transactions. Retailers only pay on actual sales generated through the platform, with zero upfront joining fees during the validation pilot.',
    },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      if (firebaseUser) {
        await submitSupportFeedback(feedbackCategory, name, contact, message);
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Support & Assistance
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          How Can We Help You?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Frequently asked questions, local helpline details, and direct feedback channel for Dehradun residents.
        </p>
      </div>

      {/* Support Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">Local Dehradun Helpline</h3>
            <p className="text-[11px] text-slate-500">Mon - Sat, 9:00 AM - 8:30 PM</p>
            <div className="text-xs font-bold text-emerald-900 pt-1">+91 98970 00001</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">Email Inquiries</h3>
            <p className="text-[11px] text-slate-500">For students & retailer partners</p>
            <div className="text-xs font-bold text-emerald-900 pt-1">support@localkart-ddn.in</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">Community Hubs</h3>
            <p className="text-[11px] text-slate-500">Karanpur & Premnagar</p>
            <div className="text-xs font-bold text-slate-800 pt-1">Dehradun, Uttarakhand</div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Everything you need to know about discovering products and reserving pickup in Dehradun
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback / Inquiry Form */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Send Feedback or Suggest a Neighbourhood Shop
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Are we missing your favourite kirana or stationery store in Dehradun? Let our ops team know!
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-white border border-emerald-300 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Feedback Received!</h4>
            <p className="text-xs text-slate-600">
              Thank you for sharing your thoughts with the LocalKart team. We will review your note during our weekly validation sprint.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setContact('');
                setMessage('');
              }}
              className="mt-3 text-xs text-emerald-800 font-bold hover:underline"
            >
              Send another note
            </button>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">I am a:</span>
              {(['customer', 'retailer', 'general'] as const).map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFeedbackCategory(cat)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                    feedbackCategory === cat
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {cat === 'customer' ? 'Student / Customer' : cat === 'retailer' ? 'Shopkeeper' : 'General Resident'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shreya Rawat"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone or Email</label>
                <input
                  type="text"
                  minLength={3}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 XXXXX or name@domain.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message or Shop Recommendation</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Suggest a store name, report an unavailable item, or ask a question..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {!firebaseUser ? (
                <button
                  type="button"
                  onClick={() => navigateTo('auth')}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline"
                >
                  Sign in with Google to persist feedback to our database
                </button>
              ) : (
                <span className="text-[11px] text-emerald-800 font-medium">
                  Signed in as {firebaseUser.email} — feedback saves directly to Cloud Firestore
                </span>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
