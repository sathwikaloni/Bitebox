import React, { useState } from 'react';
import { useDiet } from '../context/DietContext';
import { useCart } from '../context/CartContext';
import {
  FitnessGoal,
  DietaryPreference,
  ActivityLevel,
  UserDietProfile,
  DayDietPlan,
  PlannedMeal
} from '../types';
import {
  Sparkles,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  IndianRupee,
  Calendar,
  RefreshCw,
  ShoppingBag,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Clock,
  Plus
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const DietPlannerPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    dietProfile,
    weeklyPlan,
    activeDay,
    setActiveDay,
    loading,
    saveProfileAndGenerate,
    regenerateDay,
    openSwapModal
  } = useDiet();

  const { addToCart, batchAddToCart } = useCart();

  // Mode: 'plan' (viewing 7-day plan) vs 'edit_profile' (editing user info)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(!dietProfile);

  // Form State
  const [age, setAge] = useState<number>(dietProfile?.age || 26);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(dietProfile?.gender || 'male');
  const [height, setHeight] = useState<number>(dietProfile?.height || 175);
  const [weight, setWeight] = useState<number>(dietProfile?.weight || 72);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(dietProfile?.fitnessGoal || 'weight_loss');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(dietProfile?.dietaryPreference || 'vegetarian');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(dietProfile?.activityLevel || 'moderately_active');
  const [mealsPerDay, setMealsPerDay] = useState<number>(dietProfile?.mealsPerDay || 5);
  const [dailyBudget, setDailyBudget] = useState<number>(dietProfile?.dailyBudget || 650);
  const [preferredCuisine, setPreferredCuisine] = useState<string>(dietProfile?.preferredCuisine || 'All');

  // Allergies & Dislikes
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(dietProfile?.allergies || []);
  const [dislikedInput, setDislikedInput] = useState<string>(dietProfile?.dislikedFoods?.join(', ') || '');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(dietProfile?.dietaryRestrictions || []);

  const [generating, setGenerating] = useState(false);

  const allergyOptions = ['nuts', 'dairy', 'gluten', 'soy', 'eggs', 'fish', 'shellfish'];
  const restrictionOptions = [
    { id: 'low_carb', label: 'Low Carb (<40g carbs/meal)' },
    { id: 'low_fat', label: 'Low Fat (<15g fat/meal)' },
    { id: 'high_fiber', label: 'High Fiber rich' }
  ];

  const handleToggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const handleToggleRestriction = (resId: string) => {
    if (dietaryRestrictions.includes(resId)) {
      setDietaryRestrictions(dietaryRestrictions.filter(r => r !== resId));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, resId]);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    const dislikedArray = dislikedInput
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const newProfile: UserDietProfile = {
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      fitnessGoal,
      dietaryPreference,
      activityLevel,
      mealsPerDay: Number(mealsPerDay),
      dailyBudget: Number(dailyBudget),
      preferredCuisine,
      allergies: selectedAllergies,
      dislikedFoods: dislikedArray,
      dietaryRestrictions
    };

    try {
      await saveProfileAndGenerate(newProfile);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const currentDayPlan: DayDietPlan | undefined = weeklyPlan?.days ? weeklyPlan.days[activeDay] : undefined;

  // Handle Order Today's Entire Diet Plan
  const handleOrderTodayPlan = () => {
    if (!currentDayPlan || currentDayPlan.meals.length === 0) return;
    const items = currentDayPlan.meals.map(m => ({ food: m.food, quantity: 1 }));
    batchAddToCart(items, `${activeDay}'s Complete Diet Plan Added!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Nutrition Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            BiteBox Smart Diet Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
            Personalized meal plans built strictly with real, available restaurant dishes from the BiteBox menu database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-300" />
            <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Diet Profile'}</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>View Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION A: EDIT PERSONALIZED PROFILE FORM */}
      {isEditingProfile && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Personalized Nutrition Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates your resting metabolic rate (Mifflin-St Jeor) and matches dishes to your calorie targets.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Step 1 of 2
            </span>
          </div>

          <form onSubmit={handleGenerateSubmit} className="space-y-8">
            {/* 1. Body Measurements */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Physical Profile</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (years)</label>
                  <input
                    type="number"
                    min={14}
                    max={100}
                    required
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Unspecified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    required
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={200}
                    required
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Fitness Goal & Activity */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Primary Fitness Goal</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'weight_loss', label: 'Weight Loss', desc: 'Caloric deficit (~450 kcal), high satiety & protein' },
                  { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Caloric surplus (~350 kcal), 2.1g protein per kg' },
                  { id: 'maintenance', label: 'Maintenance', desc: 'Energy balance, keeps current weight & strength' },
                  { id: 'healthy_eating', label: 'Healthy Eating', desc: 'Balanced wholesome macros & micronutrient density' }
                ].map(goal => (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() => setFitnessGoal(goal.id as FitnessGoal)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      fitnessGoal === goal.id
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{goal.label}</span>
                      {fitnessGoal === goal.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Dietary Preferences & Activity Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dietary Preference</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vegetarian', label: 'Vegetarian (Pure Veg + Dairy)' },
                    { id: 'vegan', label: '100% Vegan (Plant-only)' },
                    { id: 'eggetarian', label: 'Eggetarian (Veg + Eggs)' },
                    { id: 'non_vegetarian', label: 'Non-Vegetarian (All)' }
                  ].map(pref => (
                    <button
                      type="button"
                      key={pref.id}
                      onClick={() => setDietaryPreference(pref.id as DietaryPreference)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        dietaryPreference === pref.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daily Activity Level</h3>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="sedentary">Sedentary (Desk job, little exercise · 1.2x)</option>
                  <option value="lightly_active">Lightly Active (1-3 workout days/week · 1.37x)</option>
                  <option value="moderately_active">Moderately Active (3-5 workout days/week · 1.55x)</option>
                  <option value="very_active">Very Active (6-7 hard training days · 1.72x)</option>
                  <option value="extremely_active">Extremely Active (Athletic physical job · 1.9x)</option>
                </select>
              </div>
            </div>

            {/* 4. Allergies & Dislikes */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies (Strict Exclusion)</h3>
                <span title="Meals with these allergens will be completely excluded from your recommendations" className="cursor-help">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map(alg => {
                  const isSelected = selectedAllergies.includes(alg);
                  return (
                    <button
                      type="button"
                      key={alg}
                      onClick={() => handleToggleAllergy(alg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✕ No ${alg}` : `+ ${alg}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Budget, Meals/Day & Cuisine */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meals Per Day</label>
                <select
                  value={mealsPerDay}
                  onChange={e => setMealsPerDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                >
                  <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
                  <option value={4}>4 Meals (Breakfast, Lunch, Snack, Dinner)</option>
                  <option value={5}>5 Meals (Includes Mid-Morning &amp; Evening Snacks)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Food Budget: <strong className="text-emerald-700">₹{dailyBudget}</strong>
                </label>
                <input
                  type="range"
                  min={350}
                  max={1500}
                  step={50}
                  value={dailyBudget}
                  onChange={e => setDailyBudget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹350 (Value)</span>
                  <span>₹1,500 (Gourmet)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disliked Ingredients</label>
                <input
                  type="text"
                  value={dislikedInput}
                  onChange={e => setDislikedInput(e.target.value)}
                  placeholder="e.g. mushrooms, capsicum, bitter gourd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {dietProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={generating}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Calculating Macros & Matching Menu...' : 'Generate 7-Day Diet Plan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION B: 7-DAY DIET PLAN VIEW */}
      {weeklyPlan && !isEditingProfile && (
        <div className="space-y-6">
          {/* Target Profile Summary Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fitness Target</span>
                <span className="font-bold text-slate-900 capitalize">
                  {weeklyPlan.profile.fitnessGoal.replace('_', ' ')}
                </span>
              </div>
              <span className="text-slate-200 hidden sm:inline">|</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Target</span>
                <span className="font-bold text-emerald-700">
                  {weeklyPlan.profile.targetCalories} kcal
                </span>
              </div>
              <span className="text-slate-200 hidden sm:inline">|</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Macro Goal</span>
                <span className="font-bold text-slate-800">
                  {weeklyPlan.profile.targetProtein}g Protein · {weeklyPlan.profile.targetCarbs}g Carbs · {weeklyPlan.profile.targetFats}g Fat
                </span>
              </div>
              <span className="text-slate-200 hidden sm:inline">|</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Preference</span>
                <span className="font-bold text-slate-800 capitalize">
                  {weeklyPlan.profile.dietaryPreference.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => regenerateDay(activeDay)}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate {activeDay}</span>
              </button>

              <button
                onClick={() => saveProfileAndGenerate(weeklyPlan.profile)}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate Full Week</span>
              </button>
            </div>
          </div>

          {/* 7-DAY NAVIGATION TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DAYS_OF_WEEK.map(day => {
              const isSelected = activeDay === day;
              const plan = weeklyPlan.days[day];
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 min-w-[120px] p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{day}</span>
                    <Calendar className={`w-3 h-3 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-[11px] font-medium ${isSelected ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {plan ? `${plan.totalCalories} kcal · ₹${plan.totalCost}` : 'Plan ready'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DAY MEALS BREAKDOWN */}
          {currentDayPlan && (
            <div className="space-y-6">
              {/* Daily Nutrition Totals & Quick Order Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border border-emerald-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {activeDay}'s Nutritional Breakdown
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (Estimated from actual menu recipes)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Planned Calories</span>
                      <strong className="text-lg font-extrabold text-slate-900">
                        {currentDayPlan.totalCalories}
                      </strong>
                      <span className="text-xs text-slate-500"> / {weeklyPlan.profile.targetCalories} kcal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Protein</span>
                      <strong className="text-lg font-extrabold text-emerald-700">
                        {currentDayPlan.totalProtein}g
                      </strong>
                      <span className="text-xs text-slate-500"> / {weeklyPlan.profile.targetProtein}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Carbs</span>
                      <strong className="text-lg font-extrabold text-amber-700">
                        {currentDayPlan.totalCarbs}g
                      </strong>
                      <span className="text-xs text-slate-500"> / {weeklyPlan.profile.targetCarbs}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Fats</span>
                      <strong className="text-lg font-extrabold text-slate-700">
                        {currentDayPlan.totalFats}g
                      </strong>
                      <span className="text-xs text-slate-500"> / {weeklyPlan.profile.targetFats}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Day Total Cost</span>
                      <strong className="text-lg font-extrabold text-slate-900">
                        ₹{currentDayPlan.totalCost}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Primary Button: Order Today's Diet Plan */}
                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleOrderTodayPlan}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Today's Diet Plan (₹{currentDayPlan.totalCost})</span>
                  </button>
                </div>
              </div>

              {/* Individual Meals List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentDayPlan.meals.map((meal: PlannedMeal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo & Meal Tag */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={meal.food.image}
                          alt={meal.food.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                        {/* Meal slot label */}
                        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl shadow-xs">
                          {meal.label}
                        </div>

                        {/* Veg / Non-veg symbol */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
                          <div
                            className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                              meal.food.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                meal.food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Price & Delivery Time Tag */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                          <span className="bg-slate-900/70 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-amber-300">
                            {meal.food.restaurantName}
                          </span>
                          <span className="text-base font-extrabold text-white">
                            ₹{meal.food.price}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-2">
                        <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 font-['Outfit']">
                          {meal.food.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {meal.food.description}
                        </p>

                        {/* Portion & Ingredients */}
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                          <p><strong>Portion:</strong> {meal.food.portionSize}</p>
                          <p className="truncate">
                            <strong>Ingredients:</strong> {meal.food.ingredients.join(', ')}
                          </p>
                        </div>

                        {/* Nutritional Breakdown Cards */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-xs">
                          <div className="bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-slate-400 block font-medium">Calories</span>
                            <strong className="text-emerald-800 font-bold">{meal.food.calories}</strong>
                          </div>
                          <div className="bg-blue-50/80 p-1.5 rounded-xl border border-blue-100">
                            <span className="text-[10px] text-slate-400 block font-medium">Protein</span>
                            <strong className="text-blue-800 font-bold">{meal.food.protein}g</strong>
                          </div>
                          <div className="bg-amber-50/80 p-1.5 rounded-xl border border-amber-100">
                            <span className="text-[10px] text-slate-400 block font-medium">Carbs</span>
                            <strong className="text-amber-800 font-bold">{meal.food.carbs}g</strong>
                          </div>
                          <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Fats</span>
                            <strong className="text-slate-800 font-bold">{meal.food.fats}g</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meal Actions: Swap Meal & Add to Cart */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => openSwapModal(activeDay, meal)}
                        className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                        <span>Swap Meal</span>
                      </button>

                      <button
                        onClick={() => addToCart(meal.food, 1)}
                        className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Budget & Progress Footnote */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">7-Day Plan Estimated Budget</span>
                    <p className="text-[11px] text-slate-500">
                      Total weekly food expenditure: <strong>₹{weeklyPlan.weeklyTotalCost}</strong> (Average ₹{Math.round(weeklyPlan.weeklyTotalCost / 7)}/day)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOrderTodayPlan}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Order {activeDay}'s Meals Now</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
