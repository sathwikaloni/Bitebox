import React, { useState, useEffect } from 'react';
import { Restaurant, Food } from '../types';
import { api } from '../services/api';
import { FoodCard } from './FoodCard';
import { X, Star, Clock, MapPin, Sparkles, Filter } from 'lucide-react';

interface RestaurantMenuModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({ restaurant, onClose }) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState<boolean>(false);

  useEffect(() => {
    if (!restaurant) return;
    async function loadMenu() {
      setLoading(true);
      try {
        const items = await api.getFoods({ restaurantId: restaurant!._id });
        setFoods(items);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [restaurant]);

  if (!restaurant) return null;

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'beverage'];

  const filteredFoods = foods.filter(food => {
    if (selectedCategory !== 'all' && food.category !== selectedCategory) return false;
    if (vegOnly && !food.isVeg) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner Header */}
        <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-slate-900/60 backdrop-blur-md hover:bg-slate-900 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-semibold">
              <span className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-bold">
                <Star className="w-3.5 h-3.5 fill-slate-950" /> {restaurant.rating.toFixed(1)} ({restaurant.ratingCount}+)
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-emerald-300">
                <Clock className="w-3.5 h-3.5" /> {restaurant.deliveryTime}
              </span>
              <span className="bg-slate-800/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-slate-300">
                ₹{restaurant.priceForTwo} for two
              </span>
              {restaurant.isVeg && (
                <span className="bg-emerald-600 px-2 py-0.5 rounded-md text-white font-bold">
                  Pure Veg
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">{restaurant.name}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> {restaurant.address}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Veg Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={e => setVegOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 accent-emerald-600"
            />
            <span>Pure Veg Dishes Only</span>
          </label>
        </div>

        {/* Food List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading delicious dishes...</div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500">
              No dishes found under this category filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map(food => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
