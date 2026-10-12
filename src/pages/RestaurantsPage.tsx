import React, { useState } from 'react';
import { Restaurant } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface RestaurantsPageProps {
  restaurants: Restaurant[];
  onViewMenu: (restaurant: Restaurant) => void;
  initialQuery?: string;
}

export const RestaurantsPage: React.FC<RestaurantsPageProps> = ({
  restaurants,
  onViewMenu,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'priceAsc' | 'priceDesc'>('rating');

  const cuisines = ['All', 'Healthy Bowls', 'High Protein', 'South Indian', 'North Indian', 'Asian', 'Vegan Friendly'];

  const filteredRestaurants = restaurants
    .filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.some(c => c.toLowerCase().includes(q));
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCuisine && !matchesDesc) return false;
      }
      if (selectedCuisine !== 'All') {
        if (!r.cuisine.some(c => c.toLowerCase().includes(selectedCuisine.toLowerCase()))) return false;
      }
      if (vegOnly && !r.isVeg) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'priceAsc') return a.priceForTwo - b.priceForTwo;
      if (sortBy === 'priceDesc') return b.priceForTwo - a.priceForTwo;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Culinary Partners</span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">All Restaurants on BiteBox</h1>
          <p className="text-xs text-slate-500 mt-1">
            Order fresh meals from verified kitchens. Filter by nutritional profile and dietary preference.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search restaurant or cuisine..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Pure Veg Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 select-none">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={e => setVegOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 accent-emerald-600"
              />
              <span>Pure Veg Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="rating">Rating (Highest)</option>
                <option value="priceAsc">Price (Low to High)</option>
                <option value="priceDesc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cuisine Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {cuisines.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCuisine === c
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="py-24 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 p-8">
          <p className="text-base font-bold text-slate-800">No restaurants matched your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different cuisine.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCuisine('All');
              setVegOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onViewMenu={onViewMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};
