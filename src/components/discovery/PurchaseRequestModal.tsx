import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Store, StoreListing } from '../../types';
import { X, CheckCircle2, Clock, MapPin, Store as StoreIcon, AlertCircle } from 'lucide-react';

interface PurchaseRequestModalProps {
  product: Product;
  store: Store;
  listing: StoreListing;
  onClose: () => void;
  onSuccess: (refNumber: string) => void;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({
  product,
  store,
  listing,
  onClose,
  onSuccess,
}) => {
  const { currentUser, submitPurchaseRequest } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(currentUser.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [preferredPickupTime, setPreferredPickupTime] = useState('Today, Within 2 Hours');
  const [pickupNotes, setPickupNotes] = useState('');
  const [error, setError] = useState('');

  const totalPrice = listing.price * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    const refNum = submitPurchaseRequest({
      storeId: store.id,
      storeName: store.name,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: listing.price,
          total: totalPrice,
          image: product.image,
          unit: product.unit,
        },
      ],
      totalAmount: totalPrice,
      pickupNotes: pickupNotes.trim() ? pickupNotes : undefined,
      preferredPickupTime,
    });

    onSuccess(refNum);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Hyperlocal Reservation Request
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Reserve at {store.name}
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {store.fullAddress}
          </p>
        </div>

        {/* Selected Product Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 mb-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-contain rounded bg-white p-1 border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
            <div className="text-[11px] text-slate-500">{product.brand} · {product.unit}</div>
            <div className="text-xs font-bold text-emerald-900 mt-1">
              ₹{listing.price} per unit
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quantity Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold text-slate-900 text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Total Amount: <span className="font-bold text-slate-900 text-sm">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                placeholder="e.g. Aarav Sharma"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
                placeholder="+91 98765 XXXXX"
                required
              />
            </div>
          </div>

          {/* Pickup Window */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Preferred Pickup Time
            </label>
            <select
              value={preferredPickupTime}
              onChange={(e) => setPreferredPickupTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
            >
              <option value="Today, Within 1 Hour">Today, Within 1 Hour</option>
              <option value="Today, Within 2 Hours">Today, Within 2 Hours</option>
              <option value="Today Evening (5 PM - 8 PM)">Today Evening (5 PM - 8 PM)</option>
              <option value="Tomorrow Morning (9 AM - 12 PM)">Tomorrow Morning (9 AM - 12 PM)</option>
              <option value="Flexible / Store Convenience">Flexible / Store Convenience</option>
            </select>
          </div>

          {/* Note to Retailer */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Note to Retailer (Optional)
            </label>
            <textarea
              rows={2}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g. Please keep printed receipt ready, will pay cash / UPI on pickup"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          {/* MVP Payment Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
            <span className="font-semibold">Pay Directly at Store:</span> In this MVP phase, no online payment is collected. You pay the store owner directly via Cash or UPI when collecting your items.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              Confirm Purchase Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
