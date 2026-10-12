import React, { useState } from 'react';
import { Restaurant, Food } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodCard } from '../components/FoodCard';
import {
  Sparkles,
  Search,
  ArrowRight,
  Flame,
  ShieldCheck,
  Dumbbell,
  Clock,
  HeartPulse,
  Leaf,
  CheckCircle2,
  CalendarCheck2
} from 'lucide-react';

interface HomePageProps {
  restaurants: Restaurant[];
  featuredFoods: Food[];
  onNavigate: (tab: string) => void;
  onViewMenu: (restaurant: Restaurant) => void;
  onSearch: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  restaurants,
  featuredFoods,
  onNavigate,
  onViewMenu,
  onSearch
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('restaurants');
    }
  };

  const categories = [
    { name: 'Healthy Bowls', icon: '🥗', query: 'Healthy Bowls' },
    { name: 'High Protein', icon: '🥩', query: 'High Protein' },
    { name: 'Millets & Dosas', icon: '🥞', query: 'South Indian' },
    { name: 'Pure Vegan', icon: '🌱', query: 'Vegan' },
    { name: 'Keto Friendly', icon: '🥑', query: 'Keto' },
    { name: 'Smoothies & Oats', icon: '🍓', query: 'Smoothies' }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-amber-50/40 to-white pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Highlight badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Food Delivery &amp; Smart Diet Planner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-[1.12]">
                Cravings Meet <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
                  Healthy Living.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover crave-worthy food from top local restaurants, match meals precisely to your calories &amp; macros, and plan your week with the <strong>BiteBox Smart Diet Planner</strong>.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 max-w-lg mx-auto lg:mx-0"
              >
                <div className="flex-1 flex items-center pl-3 gap-2">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search restaurant, chicken steak, millet dosa..."
                    className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('diet-planner')}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create My Diet Plan</span>
                </button>
                <button
                  onClick={() => onNavigate('restaurants')}
                  className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm bg-white hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
                >
                  Explore Restaurants
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real Restaurant Menu Items</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-amber-500" />
                  <span>Mifflin-St Jeor Macro Science</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Photo */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/3">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                    alt="Wholesome fresh macro meal bowl"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Today's Chef Recommendation</p>
                    <h3 className="text-lg font-bold">Avocado Quinoa Power Bowl</h3>
                    <p className="text-xs text-slate-200">410 kcal · 14g Protein · 100% Organic</p>
                  </div>
                </div>

                {/* Floating Macro Float Card 1 */}
                <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Deficit</span>
                    <p className="text-sm font-extrabold text-slate-900">1,850 kcal / day</p>
                  </div>
                </div>

                {/* Floating Macro Float Card 2 */}
                <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    <Dumbbell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">High Protein Match</span>
                    <p className="text-sm font-extrabold text-slate-900">128g Daily Target</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Quick Cravings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Browse by Nutritional Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('restaurants')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Menus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSearch(cat.query);
                onNavigate('restaurants');
              }}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. PROMINENT SMART DIET PLANNER PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BiteBox Unique Innovation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] leading-tight">
              "Eat What You Love. Stay Fit. <br />
              Let BiteBox Plan Your Meals."
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              Unlike ordinary food apps that leave you guessing calories, BiteBox’s algorithm reads your target deficit, protein requirement, and preferred cuisine—then schedules real, tasty meals from local partner restaurants into a full 7-day cartable plan.
            </p>

            {/* Benefit bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Real Food Items &amp; Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-Click "Order Today's Plan"</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Swap Unwanted Meals in 1 Tap</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Allergen &amp; Dislike Filtering</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('diet-planner')}
                className="px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Launch Smart Diet Planner</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-sm border border-emerald-500/30 transition-all cursor-pointer"
              >
                View Diet Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR RESTAURANTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Rated Partners</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Popular Kitchens on BiteBox
            </h2>
            <p className="text-xs text-slate-500 mt-1">Verified hygiene, top customer reviews, and transparent macro labels.</p>
          </div>
          <button
            onClick={() => onNavigate('restaurants')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See All Restaurants ({restaurants.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.slice(0, 6).map(restaurant => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onViewMenu={onViewMenu}
            />
          ))}
        </div>
      </section>

      {/* 5. FEATURED HEALTHY DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Nutrient Packed</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Featured Macro-Counted Meals
            </h2>
            <p className="text-xs text-slate-500 mt-1">Add straight to your cart or include in your custom diet plan.</p>
          </div>
          <button
            onClick={() => onNavigate('restaurants')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredFoods.slice(0, 8).map(food => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      </section>

      {/* 6. HOW BITEBOX WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Three Simple Steps to Fit Living
            </h2>
            <p className="text-xs text-slate-500">
              No complicated calorie counting apps. No sad boiled salads. Real food delivered to your door.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Set Your Fitness Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your age, height, weight, activity level, and goal (Weight Loss, Muscle Gain, or Maintenance) along with dietary preference and allergies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Get a 7-Day Menu Plan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                BiteBox scans available local restaurant menus to recommend exact real dishes matching your calorie budget. Swap any meal with 1 click.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg mx-auto sm:mx-0">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">1-Click Order &amp; Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click "Order Today's Diet Plan" to batch-add meals to your cart. Mark meals as consumed on your Diet Dashboard to track progress!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
