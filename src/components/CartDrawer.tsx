import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
  onNavigate: (tab: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout, onNavigate }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-100">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Your BiteBox Cart</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.items.length === 0 ? 'Empty' : `${cart.items.length} unique dishes`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6 leading-relaxed">
                  Discover mouthwatering local restaurants or build your 7-day personalized diet plan.
                </p>
                <div className="flex flex-col w-full gap-2.5 max-w-xs">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onNavigate('diet-planner');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Plan Meals with Diet Planner
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onNavigate('restaurants');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Explore Restaurants
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</span>
                  <button
                    onClick={() => clearCart()}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                </div>

                {cart.items.map(item => (
                  <div
                    key={item.food._id}
                    className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                            title={item.food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                          <p className="text-xs font-semibold text-slate-500 truncate">{item.food.restaurantName}</p>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{item.food.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.food.calories} kcal · {item.food.protein}g protein
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                            className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                            className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer & Bill Breakdown */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4 shadow-lg">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {cart.deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{cart.deliveryFee}</span>
                  )}
                </div>
                {cart.subtotal < 499 && (
                  <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                    Add ₹{499 - cart.subtotal} more to get Free Delivery!
                  </p>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>To Pay</span>
                  <span className="text-emerald-700">₹{cart.total}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe &amp; contactless delivery verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
