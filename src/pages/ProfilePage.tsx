import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDiet } from '../context/DietContext';
import { api } from '../services/api';
import { User, Phone, MapPin, Mail, Award, Sparkles, CheckCircle2, ShoppingBag, HeartPulse } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { dietProfile } = useDiet();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ orderCount: number; totalSpent: number }>({ orderCount: 0, totalSpent: 0 });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
    async function loadStats() {
      try {
        const data = await api.getUserProfile();
        setStats({ orderCount: data.orderCount, totalSpent: data.totalSpent });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    }
    loadStats();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({ name, phone, address });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0 font-['Outfit']">
          {user?.name.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{user?.name}</h1>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              BiteBox Member
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span>{stats.orderCount} Orders Placed</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>₹{stats.totalSpent} Total Spent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Account Settings Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Account Details &amp; Address</h2>
            <p className="text-xs text-slate-500 mt-0.5">Keep your contact and delivery coordinates up to date.</p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Account ID)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={3}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Apartment, Street, Area, Landmark"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Update Profile Details'}
            </button>
          </form>
        </div>

        {/* Right: Diet Profile Summary (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Your Diet Settings</h3>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>

            {dietProfile ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Fitness Goal</span>
                  <span className="font-bold text-slate-900 capitalize">{dietProfile.fitnessGoal.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Dietary Preference</span>
                  <span className="font-bold text-emerald-700 capitalize">{dietProfile.dietaryPreference.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Target Calories</span>
                  <span className="font-extrabold text-slate-900">{dietProfile.targetCalories} kcal / day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Target Protein</span>
                  <span className="font-bold text-blue-700">{dietProfile.targetProtein}g / day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Daily Food Budget</span>
                  <span className="font-bold text-slate-900">₹{dietProfile.dailyBudget}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Allergens Excluded</span>
                  <span className="font-medium text-rose-600">
                    {dietProfile.allergies.length > 0 ? dietProfile.allergies.join(', ') : 'None'}
                  </span>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => onNavigate('diet-planner')}
                    className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer border border-emerald-200"
                  >
                    Adjust Diet Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-3">
                <p>No active diet profile configured yet.</p>
                <button
                  onClick={() => onNavigate('diet-planner')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  Configure My Diet Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
