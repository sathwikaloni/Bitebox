import React from 'react';
import { UtensilsCrossed, ShieldCheck, HeartPulse, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-['Outfit']">
                Bite<span className="text-emerald-400">Box</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Eat what you love. Stay fit. Let BiteBox plan your meals. Connecting the best local culinary kitchens with precision health and macro-matched daily diet plans.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Real Menu Pricing
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <HeartPulse className="w-4 h-4" /> Verified Nutrition
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">Explore BiteBox</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Featured Eateries
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('restaurants')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  All Restaurants
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('diet-planner')} className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Smart Diet Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Health Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Live Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Diet Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">Fitness Diets</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Weight Loss Deficit Plans</li>
              <li>High Protein Muscle Gain</li>
              <li>Pure Vegan &amp; Plant-Powered</li>
              <li>Low Carb &amp; Keto Bowls</li>
              <li>Heart-Healthy Whole Grains</li>
              <li>Zero Refined Sugar Snacks</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">Support &amp; Hub</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>BiteBox FoodTech Pvt Ltd, Koramangala 4th Block, Bengaluru, KA 560034</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 80 4960 1200 (8 AM - 11 PM)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@bitebox.food</span>
              </p>
            </div>
          </div>
        </div>

        {/* Nutritional & Medical Disclaimer as per Requirements */}
        <div className="pt-8 text-center sm:text-left text-xs text-slate-500 leading-relaxed space-y-2">
          <p className="text-slate-400">
            <strong className="text-slate-300">Nutritional Disclaimer:</strong> The nutritional values, macro splits, and calorie targets provided by the BiteBox Smart Diet Planner are estimated guidelines calculated using scientific formulas (Mifflin-St Jeor) and standard culinary ingredient data. They are designed for general wellness and meal planning, and are not a substitute for clinical medical advice, personalized diagnosis, or treatment by a qualified healthcare professional.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-600 gap-2">
            <p>&copy; {new Date().getFullYear()} BiteBox Technologies Inc. All rights reserved.</p>
            <p>Designed with care for healthy eaters and cravings alike.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
