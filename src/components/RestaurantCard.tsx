import React from 'react';
import { Restaurant } from '../types';
import { Star, Clock, IndianRupee, ArrowRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewMenu: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewMenu }) => {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image container */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Veg tag */}
        {restaurant.isVeg && (
          <span className="absolute top-3.5 left-3.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Pure Veg
          </span>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 font-normal">({restaurant.ratingCount})</span>
        </div>

        {/* Delivery Time Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-medium text-white shadow-sm">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 font-['Outfit']">
            {restaurant.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {restaurant.description}
          </p>

          {/* Unboxed clean metadata (zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span className="truncate">{restaurant.cuisine.join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 font-semibold text-slate-700">₹{restaurant.priceForTwo} for two</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-2">
          <button
            onClick={() => onViewMenu(restaurant)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-md"
          >
            <span>View Menu &amp; Macros</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
