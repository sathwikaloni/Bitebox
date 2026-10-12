import React, { useState } from 'react';
import { useDiet } from '../context/DietContext';
import { useCart } from '../context/CartContext';
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  IndianRupee,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

export const DietDashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { dashboardStats, activeDay, markMealConsumed, weeklyPlan } = useDiet();
  const { batchAddToCart } = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!dashboardStats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400">
        Loading personalized diet dashboard...
      </div>
    );
  }

  const { targets, planned, consumed, todayPlan, todayDay } = dashboardStats;

  // Percentage calculations
  const plannedCaloriePercent = Math.min(100, Math.round((planned.calories / (targets.targetCalories || 1)) * 100));
  const consumedCaloriePercent = Math.min(100, Math.round((consumed.calories / (targets.targetCalories || 1)) * 100));
  const consumedProteinPercent = Math.min(100, Math.round((consumed.protein / (targets.targetProtein || 1)) * 100));

  const handleToggleConsumed = async (mealId: string, currentStatus: string) => {
    setUpdatingId(mealId);
    try {
      const newStatus = currentStatus === 'consumed' ? 'planned' : 'consumed';
      await markMealConsumed(todayDay, mealId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOrderRemaining = () => {
    if (!todayPlan) return;
    const remaining = todayPlan.meals.filter(m => m.status === 'planned');
    if (remaining.length === 0) return;
    const items = remaining.map(m => ({ food: m.food, quantity: 1 }));
    batchAddToCart(items, `Added ${remaining.length} planned meals to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-['Outfit']">
              Live Nutritional Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Today's Diet Performance
          </h1>
          <p className="text-xs text-slate-400">
            Real-time tracking for <strong className="text-white">{todayDay}</strong>. Accurately distinguishes between Planned, Ordered, and Consumed nutrition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('diet-planner')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>View 7-Day Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calories Intake</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{consumed.calories}</span>
              <span className="text-xs text-slate-400 font-medium">/ {targets.targetCalories} kcal goal</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Consumed: {consumedCaloriePercent}%</span>
              <span>Planned: {planned.calories} kcal</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${consumedCaloriePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protein Goal</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{consumed.protein}g</span>
              <span className="text-xs text-slate-400 font-medium">/ {targets.targetProtein}g target</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Progress: {consumedProteinPercent}%</span>
              <span>Planned: {planned.protein}g</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${consumedProteinPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meals Consumed Today */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meals Eaten</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{consumed.count}</span>
              <span className="text-xs text-slate-400 font-medium">/ {consumed.totalMeals} planned</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Remaining today: {consumed.totalMeals - consumed.count}</span>
            <span className="font-bold text-emerald-700">
              {consumed.totalMeals > 0 ? `${Math.round((consumed.count / consumed.totalMeals) * 100)}% adherence` : 'No plan'}
            </span>
          </div>
        </div>

        {/* Estimated Food Expenditure */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Food Expenditure</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">₹{planned.cost}</span>
              <span className="text-xs text-slate-400 font-medium">planned today</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Weekly Total: ₹{dashboardStats.weeklyTotalCost}</span>
            <span className="font-semibold text-slate-700">Orders: {dashboardStats.dietOrderCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Meals Timeline & Clinical Nutritional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Today's Planned vs Consumed Meal Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
                {todayDay}'s Meal Timeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check off meals once consumed to update your actual metabolic intake.
              </p>
            </div>

            {todayPlan && todayPlan.meals.some(m => m.status === 'planned') && (
              <button
                onClick={handleOrderRemaining}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order Remaining Meals</span>
              </button>
            )}
          </div>

          {/* Meals Timeline List */}
          {!todayPlan || todayPlan.meals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No meal plan generated for today yet.
            </div>
          ) : (
            <div className="space-y-4">
              {todayPlan.meals.map(meal => {
                const isConsumed = meal.status === 'consumed';
                const isOrdered = meal.status === 'ordered';

                return (
                  <div
                    key={meal.id}
                    className={`flex items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                      isConsumed
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox to Mark Consumed */}
                      <button
                        onClick={() => handleToggleConsumed(meal.id, meal.status)}
                        disabled={updatingId === meal.id}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isConsumed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                        title={isConsumed ? 'Mark as Planned' : 'Mark as Consumed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <img
                        src={meal.food.image}
                        alt={meal.food.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {meal.label}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-slate-500 truncate">{meal.food.restaurantName}</span>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isConsumed
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOrdered
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isConsumed ? 'Consumed' : isOrdered ? 'Ordered' : 'Planned'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate">{meal.food.name}</h4>

                        {/* Unboxed macro text */}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {meal.food.calories} kcal · {meal.food.protein}g protein · {meal.food.carbs}g carbs · ₹{meal.food.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleConsumed(meal.id, meal.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isConsumed
                            ? 'text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {isConsumed ? 'Consumed ✓' : 'Mark Eaten'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Macro Distribution & Guidelines Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Macronutrient Split */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Daily Macro Distribution</h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Protein ({consumed.protein}g of {targets.targetProtein}g)</span>
                  <span className="text-blue-700 font-bold">{consumedProteinPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${consumedProteinPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Carbohydrates ({consumed.carbs}g of {targets.targetCarbs}g)</span>
                  <span className="text-amber-700 font-bold">
                    {Math.min(100, Math.round((consumed.carbs / (targets.targetCarbs || 1)) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((consumed.carbs / (targets.targetCarbs || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Fats ({consumed.fats}g of {targets.targetFats}g)</span>
                  <span className="text-emerald-700 font-bold">
                    {Math.min(100, Math.round((consumed.fats / (targets.targetFats || 1)) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((consumed.fats / (targets.targetFats || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
              💡 <strong>Pro Tip:</strong> Reaching 100% of your protein target while staying under total calories is the single best predictor of maintaining lean tissue.
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <h4 className="text-base font-bold font-['Outfit']">Ready to Adjust Your Plan?</h4>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Need more calories or want to swap meals? Use our 7-day planner to regenerate recommendations or customize individual dishes.
            </p>
            <button
              onClick={() => onNavigate('diet-planner')}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Diet Planner</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
