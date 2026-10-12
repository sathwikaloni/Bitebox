import React from 'react';
import { useDiet } from '../context/DietContext';
import { Food } from '../types';
import { X, ArrowRightLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

export const MealSwapModal: React.FC = () => {
  const { swapModal, closeSwapModal, swapMeal } = useDiet();

  if (!swapModal.isOpen || !swapModal.meal) return null;

  const current = swapModal.meal.food;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={closeSwapModal}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {swapModal.day} · {swapModal.meal.label}
            </span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit']">Swap Meal with Real Menu Items</h3>
          <p className="text-xs text-slate-300 mt-1">
            Choose an alternative dish from BiteBox partner kitchens that fits your calories and macro budget.
          </p>
        </div>

        {/* Current Dish Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
          <img
            src={current.image}
            alt={current.name}
            className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Meal</span>
              <span className="text-xs text-slate-500">· {current.restaurantName}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate">{current.name}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
              <span><strong>{current.calories}</strong> kcal</span>
              <span><strong>{current.protein}g</strong> protein</span>
              <span><strong>{current.carbs}g</strong> carbs</span>
              <span><strong>{current.fats}g</strong> fats</span>
              <span className="font-extrabold text-slate-900">₹{current.price}</span>
            </div>
          </div>
        </div>

        {/* Alternative Candidates */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Alternatives From Our Menu ({swapModal.alternatives.length})
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Verified Menu Items
            </span>
          </div>

          {swapModal.loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Scanning restaurant menus for nutrition-matched dishes...
            </div>
          ) : swapModal.alternatives.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold">No direct alternative fits your strict allergen and diet criteria.</p>
              <p className="text-[11px] text-slate-400">Try adjusting disliked foods or dietary restrictions in your diet profile.</p>
            </div>
          ) : (
            swapModal.alternatives.map((alt: Food) => {
              const calDiff = alt.calories - current.calories;
              const protDiff = alt.protein - current.protein;
              const priceDiff = alt.price - current.price;

              return (
                <div
                  key={alt._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all bg-white shadow-xs"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={alt.image}
                      alt={alt.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${alt.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}
                        />
                        <span className="text-xs font-semibold text-slate-500 truncate">{alt.restaurantName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{alt.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {alt.portionSize} · {alt.ingredients.slice(0, 3).join(', ')}
                      </p>

                      {/* Side-by-side Comparative Metrics */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs mt-2 text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {alt.calories} kcal ({calDiff > 0 ? `+${calDiff}` : `${calDiff}`})
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {alt.protein}g P ({protDiff > 0 ? `+${protDiff}g` : `${protDiff}g`})
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {alt.carbs}g C
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {alt.fats}g F
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-slate-900 block">₹{alt.price}</span>
                      <span className="text-[11px] text-slate-400">
                        {priceDiff === 0 ? 'Same price' : priceDiff > 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`}
                      </span>
                    </div>

                    <button
                      onClick={() => swapMeal(swapModal.day, swapModal.meal!.id, alt._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Select Swap
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
