import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Clock, CheckCircle2, Truck, PackageCheck, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (tab: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { batchAddToCart } = useCart();

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleReorder = (order: Order) => {
    const items = order.items.map(it => ({
      food: {
        _id: it.foodId,
        name: it.foodName,
        price: it.price,
        image: it.image,
        restaurantName: it.restaurantName,
        calories: it.calories || 300,
        protein: it.protein || 15
      } as any,
      quantity: it.quantity
    }));
    batchAddToCart(items, `Re-ordered items from Order #${order._id.substring(4)}`);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case 'On the way':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Out for Delivery
          </span>
        );
      case 'Preparing':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> In the Kitchen
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
            <PackageCheck className="w-3.5 h-3.5 text-slate-600" /> Placed
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Account Activity</span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Your Order History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review placed orders, tracked deliveries, and dietary plan batches.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try ordering from top local restaurants or generate your personalized 7-day diet plan today.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('restaurants')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Browse Restaurants
            </button>
            <button
              onClick={() => onNavigate('diet-planner')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              Create Diet Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                      Order #{order._id.substring(4)}
                    </span>
                    {order.isDietPlanOrder && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {order.dietPlanDay ? `${order.dietPlanDay}'s Diet Plan` : 'Diet Plan Batch'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-base font-extrabold text-slate-900">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100"
                  >
                    <img
                      src={item.image}
                      alt={item.foodName}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.foodName}</h4>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} · ₹{item.price * item.quantity}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{item.restaurantName}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p className="truncate max-w-md">
                  <strong>Delivered to:</strong> {order.deliveryAddress}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-xs font-bold transition-colors cursor-pointer hover:bg-slate-50"
                  >
                    Reorder Items
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
