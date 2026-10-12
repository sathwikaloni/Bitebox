import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, MapPin, Phone, CreditCard, QrCode, Banknote, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  dietPlanDay?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  dietPlanDay
}) => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const [address, setAddress] = useState(user?.address || '404 12th Main, 4th Block, Koramangala, Bengaluru');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [customerName, setCustomerName] = useState(user?.name || 'Alex Johnson');
  const [paymentMethod, setPaymentMethod] = useState<'UPI / NetBanking' | 'Card' | 'Cash on Delivery'>('UPI / NetBanking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide a delivery address');
      return;
    }
    if (cart.items.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = cart.items.map(item => ({
        foodId: item.food._id,
        foodName: item.food.name,
        price: item.food.price,
        quantity: item.quantity,
        image: item.food.image,
        restaurantName: item.food.restaurantName,
        calories: item.food.calories,
        protein: item.food.protein
      }));

      const res = await api.createOrder({
        items: orderItems,
        deliveryAddress: address.trim(),
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        paymentMethod,
        isDietPlanOrder: !!dietPlanDay,
        dietPlanDay: dietPlanDay || ''
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {
        // ignore in non-browser
      }

      await clearCart();
      onOrderSuccess(res.order._id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-['Outfit']">Complete Your Order</h3>
            {dietPlanDay && (
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {dietPlanDay}'s Diet Plan
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review delivery address and choose your payment method.
          </p>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Details</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI / NetBanking'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI / NetBanking'}
                  onChange={() => setPaymentMethod('UPI / NetBanking')}
                  className="sr-only"
                />
                <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">UPI / QR</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  className="sr-only"
                />
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Debit / Card</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="sr-only"
                />
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Order Summary & Macros */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900">Items Summary ({cart.items.length})</h5>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {cart.items.map(item => (
                <div key={item.food._id} className="flex justify-between items-center text-xs text-slate-600">
                  <span className="truncate max-w-[240px]">
                    {item.food.name} <strong className="text-slate-800">x{item.quantity}</strong>
                  </span>
                  <span className="font-semibold text-slate-900">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Grand Total</span>
              <span className="text-emerald-700 text-base">₹{cart.total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Confirming order...' : `Pay ₹${cart.total} & Place Order`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
