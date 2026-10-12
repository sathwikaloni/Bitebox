import React from 'react';
import { Food } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Flame, Dumbbell } from 'lucide-react';

interface FoodCardProps {
  food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.items.find(item => item.food._id === food._id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between p-4">
      <div>
        {/* Image & Dietary symbol */}
        <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Standard Veg / Non-Veg food symbol */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
            <div
              className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                food.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </div>
          </div>

          {/* Diet friendly tag */}
          {food.isDietFriendly && (
            <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Fit Pick
            </span>
          )}

          {/* Calorie & Protein Overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
            <span className="flex items-center gap-1 text-amber-300">
              <Flame className="w-3.5 h-3.5" /> {food.calories} kcal
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Dumbbell className="w-3.5 h-3.5" /> {food.protein}g protein
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 truncate">{food.restaurantName}</p>
          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {food.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* Macro Breakdown (Carbs, Fats, Portion) */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>{food.portionSize}</span>
            <span aria-hidden="true">·</span>
            <span>{food.carbs}g C</span>
            <span aria-hidden="true">·</span>
            <span>{food.fats}g F</span>
          </div>
        </div>
      </div>

      {/* Price & Add to Cart button */}
      <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-slate-100">
        <div>
          <span className="text-base font-extrabold text-slate-900">₹{food.price}</span>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-2 py-1 shadow-2xs">
            <button
              onClick={() => updateQuantity(food._id, quantity - 1)}
              className="text-emerald-800 hover:text-emerald-950 p-0.5 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-emerald-900 w-4 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(food._id, quantity + 1)}
              className="text-emerald-800 hover:text-emerald-950 p-0.5 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(food, 1)}
            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};
