import { Food, UserDietProfile, WeeklyDietPlan, DayDietPlan, PlannedMeal, MealType } from './types.js';
import { db } from './db.js';

export function calculateMetrics(profile: UserDietProfile): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
} {
  const { weight, height, age, gender, activityLevel, fitnessGoal } = profile;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average baseline
  }

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };

  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Goal calorie adjustment
  let targetCalories = tdee;
  let targetProtein = 0; // grams
  let targetFats = 0; // grams
  let targetCarbs = 0; // grams

  if (fitnessGoal === 'weight_loss') {
    // Healthy deficit of ~400-500 kcal
    targetCalories = Math.max(gender === 'female' ? 1250 : 1500, tdee - 450);
    targetProtein = Math.round(weight * 1.8); // 1.8g/kg
    const fatCalories = targetCalories * 0.25;
    targetFats = Math.round(fatCalories / 9);
    const remainingCalories = targetCalories - (targetProtein * 4 + fatCalories);
    targetCarbs = Math.max(50, Math.round(remainingCalories / 4));
  } else if (fitnessGoal === 'muscle_gain') {
    // Lean surplus of ~350 kcal
    targetCalories = tdee + 350;
    targetProtein = Math.round(weight * 2.1); // 2.1g/kg
    const fatCalories = targetCalories * 0.25;
    targetFats = Math.round(fatCalories / 9);
    const remainingCalories = targetCalories - (targetProtein * 4 + fatCalories);
    targetCarbs = Math.max(100, Math.round(remainingCalories / 4));
  } else if (fitnessGoal === 'healthy_eating') {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.5);
    const fatCalories = targetCalories * 0.25;
    targetFats = Math.round(fatCalories / 9);
    const remainingCalories = targetCalories - (targetProtein * 4 + fatCalories);
    targetCarbs = Math.round(remainingCalories / 4);
  } else {
    // Maintenance
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.6);
    const fatCalories = targetCalories * 0.25;
    targetFats = Math.round(fatCalories / 9);
    const remainingCalories = targetCalories - (targetProtein * 4 + fatCalories);
    targetCarbs = Math.round(remainingCalories / 4);
  }

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories: Math.round(targetCalories),
    targetProtein: Math.max(40, targetProtein),
    targetCarbs: Math.max(50, targetCarbs),
    targetFats: Math.max(30, targetFats)
  };
}

export function filterSuitableFoods(allFoods: Food[], profile: UserDietProfile): Food[] {
  return allFoods.filter(food => {
    // Dietary preference filter
    if (profile.dietaryPreference === 'vegetarian') {
      if (!food.isVeg && food.dietaryType !== 'vegan') return false;
    } else if (profile.dietaryPreference === 'vegan') {
      if (food.dietaryType !== 'vegan') return false;
    } else if (profile.dietaryPreference === 'eggetarian') {
      if (!food.isVeg && food.dietaryType !== 'eggetarian' && food.dietaryType !== 'vegan') {
        return false;
      }
    }

    // Allergies filter
    if (profile.allergies && profile.allergies.length > 0) {
      for (const allergen of profile.allergies) {
        const lowerAllergen = allergen.toLowerCase();
        if (food.allergens.some(a => a.toLowerCase().includes(lowerAllergen))) {
          return false;
        }
        // Also inspect ingredient names for safety
        if (food.ingredients.some(ing => ing.toLowerCase().includes(lowerAllergen))) {
          return false;
        }
      }
    }

    // Disliked foods filter
    if (profile.dislikedFoods && profile.dislikedFoods.length > 0) {
      for (const disliked of profile.dislikedFoods) {
        const lowerDisliked = disliked.toLowerCase().trim();
        if (!lowerDisliked) continue;
        if (
          food.name.toLowerCase().includes(lowerDisliked) ||
          food.ingredients.some(ing => ing.toLowerCase().includes(lowerDisliked))
        ) {
          return false;
        }
      }
    }

    // Dietary restrictions filter
    if (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) {
      if (profile.dietaryRestrictions.includes('low_carb') && food.carbs > 40) {
        return false;
      }
      if (profile.dietaryRestrictions.includes('low_fat') && food.fats > 15) {
        return false;
      }
    }

    return true;
  });
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function generateWeeklyDietPlan(profile: UserDietProfile): WeeklyDietPlan {
  const metrics = calculateMetrics(profile);
  const updatedProfile: UserDietProfile = { ...profile, ...metrics };
  const allFoods = db.getFoods();
  const suitableFoods = filterSuitableFoods(allFoods, updatedProfile);

  // Group foods by category
  const breakfastFoods = suitableFoods.filter(f => f.category === 'breakfast');
  const lunchFoods = suitableFoods.filter(f => f.category === 'lunch');
  const dinnerFoods = suitableFoods.filter(f => f.category === 'dinner');
  const snackFoods = suitableFoods.filter(f => f.category === 'snack' || f.category === 'beverage');

  // Fallbacks if user preferences are very strict
  const safeBreakfast = breakfastFoods.length > 0 ? breakfastFoods : allFoods.filter(f => f.category === 'breakfast');
  const safeLunch = lunchFoods.length > 0 ? lunchFoods : allFoods.filter(f => f.category === 'lunch');
  const safeDinner = dinnerFoods.length > 0 ? dinnerFoods : allFoods.filter(f => f.category === 'dinner');
  const safeSnacks = snackFoods.length > 0 ? snackFoods : allFoods.filter(f => f.category === 'snack');

  // Calorie distribution ratios based on mealsPerDay
  const mealsCount = profile.mealsPerDay || 5;

  const daysPlan: any = {};
  let weeklyTotalCost = 0;
  let totalCaloriesAcrossWeek = 0;

  // Track foods used on previous day to prevent boring repetition
  let prevBreakfastId = '';
  let prevLunchId = '';
  let prevDinnerId = '';

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    const mealSlots: { mealType: MealType; label: string; targetRatio: number }[] = [];

    if (mealsCount === 3) {
      mealSlots.push(
        { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.3 },
        { mealType: 'lunch', label: 'Lunch', targetRatio: 0.4 },
        { mealType: 'dinner', label: 'Dinner', targetRatio: 0.3 }
      );
    } else if (mealsCount === 4) {
      mealSlots.push(
        { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.25 },
        { mealType: 'lunch', label: 'Lunch', targetRatio: 0.35 },
        { mealType: 'evening_snack', label: 'Evening Snack', targetRatio: 0.15 },
        { mealType: 'dinner', label: 'Dinner', targetRatio: 0.25 }
      );
    } else {
      mealSlots.push(
        { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.25 },
        { mealType: 'mid_morning', label: 'Mid-Morning Snack', targetRatio: 0.1 },
        { mealType: 'lunch', label: 'Lunch', targetRatio: 0.35 },
        { mealType: 'evening_snack', label: 'Evening Snack', targetRatio: 0.1 },
        { mealType: 'dinner', label: 'Dinner', targetRatio: 0.2 }
      );
    }

    const plannedMeals: PlannedMeal[] = [];
    let dayCalories = 0;
    let dayProtein = 0;
    let dayCarbs = 0;
    let dayFats = 0;
    let dayCost = 0;

    for (const slot of mealSlots) {
      let pool: Food[] = [];
      let prevId = '';

      if (slot.mealType === 'breakfast') {
        pool = safeBreakfast;
        prevId = prevBreakfastId;
      } else if (slot.mealType === 'lunch') {
        pool = safeLunch;
        prevId = prevLunchId;
      } else if (slot.mealType === 'dinner') {
        pool = safeDinner;
        prevId = prevDinnerId;
      } else {
        pool = safeSnacks;
      }

      // Filter out immediate predecessor if options exist
      let candidates = pool.filter(f => f._id !== prevId);
      if (candidates.length === 0) candidates = pool;

      // Select candidate that best approximates target calories for this slot
      const targetMealCals = (updatedProfile.targetCalories || 2000) * slot.targetRatio;

      // Rank candidates by calorie proximity and goal fit
      candidates.sort((a, b) => {
        const diffA = Math.abs(a.calories - targetMealCals);
        const diffB = Math.abs(b.calories - targetMealCals);
        if (updatedProfile.fitnessGoal === 'muscle_gain') {
          return b.protein - a.protein || diffA - diffB;
        }
        if (updatedProfile.fitnessGoal === 'weight_loss') {
          return a.calories - b.calories || diffA - diffB;
        }
        return diffA - diffB;
      });

      // Introduce pseudo-random rotation across the week to vary dishes
      const pickIndex = (dayIndex + (slot.mealType === 'mid_morning' ? 1 : 0)) % candidates.length;
      const selectedFood = candidates[pickIndex] || candidates[0] || allFoods[0];

      if (slot.mealType === 'breakfast') prevBreakfastId = selectedFood._id;
      if (slot.mealType === 'lunch') prevLunchId = selectedFood._id;
      if (slot.mealType === 'dinner') prevDinnerId = selectedFood._id;

      plannedMeals.push({
        id: `meal-${day.toLowerCase()}-${slot.mealType}`,
        mealType: slot.mealType,
        label: slot.label,
        targetCaloriesRatio: slot.targetRatio,
        food: selectedFood,
        status: 'planned'
      });

      dayCalories += selectedFood.calories;
      dayProtein += selectedFood.protein;
      dayCarbs += selectedFood.carbs;
      dayFats += selectedFood.fats;
      dayCost += selectedFood.price;
    }

    daysPlan[day] = {
      day,
      meals: plannedMeals,
      totalCalories: dayCalories,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFats: dayFats,
      totalCost: dayCost
    };

    weeklyTotalCost += dayCost;
    totalCaloriesAcrossWeek += dayCalories;
  });

  return {
    id: 'plan-' + Date.now().toString(36),
    profile: updatedProfile,
    days: daysPlan,
    weeklyTotalCost,
    averageDailyCalories: Math.round(totalCaloriesAcrossWeek / 7),
    createdAt: new Date().toISOString()
  };
}

export function findSwapAlternatives(
  currentFoodId: string,
  mealType: MealType,
  profile: UserDietProfile
): { currentFood: Food; alternatives: Food[] } {
  const currentFood = db.getFoodById(currentFoodId) || db.getFoods()[0];
  const allFoods = db.getFoods();
  const suitableFoods = filterSuitableFoods(allFoods, profile);

  // Category match
  let categoryPool = suitableFoods.filter(f => {
    if (mealType === 'breakfast') return f.category === 'breakfast';
    if (mealType === 'lunch') return f.category === 'lunch';
    if (mealType === 'dinner') return f.category === 'dinner';
    return f.category === 'snack' || f.category === 'beverage';
  });

  if (categoryPool.length < 2) {
    categoryPool = allFoods.filter(f => f.category === currentFood.category);
  }

  // Filter out the current food itself
  const alternatives = categoryPool.filter(f => f._id !== currentFoodId);

  // Sort by closest nutritional profile and goal suitability
  alternatives.sort((a, b) => {
    const diffA = Math.abs(a.calories - currentFood.calories);
    const diffB = Math.abs(b.calories - currentFood.calories);
    return diffA - diffB;
  });

  return {
    currentFood,
    alternatives: alternatives.slice(0, 5)
  };
}

export function regenerateSingleDayPlan(
  plan: WeeklyDietPlan,
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
): WeeklyDietPlan {
  const profile = plan.profile;
  const allFoods = db.getFoods();
  const suitableFoods = filterSuitableFoods(allFoods, profile);

  const safeBreakfast = suitableFoods.filter(f => f.category === 'breakfast').length > 0
    ? suitableFoods.filter(f => f.category === 'breakfast')
    : allFoods.filter(f => f.category === 'breakfast');
  const safeLunch = suitableFoods.filter(f => f.category === 'lunch').length > 0
    ? suitableFoods.filter(f => f.category === 'lunch')
    : allFoods.filter(f => f.category === 'lunch');
  const safeDinner = suitableFoods.filter(f => f.category === 'dinner').length > 0
    ? suitableFoods.filter(f => f.category === 'dinner')
    : allFoods.filter(f => f.category === 'dinner');
  const safeSnacks = suitableFoods.filter(f => f.category === 'snack' || f.category === 'beverage').length > 0
    ? suitableFoods.filter(f => f.category === 'snack' || f.category === 'beverage')
    : allFoods.filter(f => f.category === 'snack');

  const mealsCount = profile.mealsPerDay || 5;
  const mealSlots: { mealType: MealType; label: string; targetRatio: number }[] = [];

  if (mealsCount === 3) {
    mealSlots.push(
      { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.3 },
      { mealType: 'lunch', label: 'Lunch', targetRatio: 0.4 },
      { mealType: 'dinner', label: 'Dinner', targetRatio: 0.3 }
    );
  } else if (mealsCount === 4) {
    mealSlots.push(
      { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.25 },
      { mealType: 'lunch', label: 'Lunch', targetRatio: 0.35 },
      { mealType: 'evening_snack', label: 'Evening Snack', targetRatio: 0.15 },
      { mealType: 'dinner', label: 'Dinner', targetRatio: 0.25 }
    );
  } else {
    mealSlots.push(
      { mealType: 'breakfast', label: 'Breakfast', targetRatio: 0.25 },
      { mealType: 'mid_morning', label: 'Mid-Morning Snack', targetRatio: 0.1 },
      { mealType: 'lunch', label: 'Lunch', targetRatio: 0.35 },
      { mealType: 'evening_snack', label: 'Evening Snack', targetRatio: 0.1 },
      { mealType: 'dinner', label: 'Dinner', targetRatio: 0.2 }
    );
  }

  // Shuffle/rotate so new dishes are chosen
  const randomShift = Math.floor(Math.random() * 5) + 1;
  const plannedMeals: PlannedMeal[] = [];
  let dayCalories = 0;
  let dayProtein = 0;
  let dayCarbs = 0;
  let dayFats = 0;
  let dayCost = 0;

  for (let i = 0; i < mealSlots.length; i++) {
    const slot = mealSlots[i];
    let pool = safeSnacks;
    if (slot.mealType === 'breakfast') pool = safeBreakfast;
    if (slot.mealType === 'lunch') pool = safeLunch;
    if (slot.mealType === 'dinner') pool = safeDinner;

    const pickIdx = (i + randomShift) % pool.length;
    const selectedFood = pool[pickIdx] || pool[0];

    plannedMeals.push({
      id: `meal-${day.toLowerCase()}-${slot.mealType}-${Date.now().toString(36).slice(-3)}`,
      mealType: slot.mealType,
      label: slot.label,
      targetCaloriesRatio: slot.targetRatio,
      food: selectedFood,
      status: 'planned'
    });

    dayCalories += selectedFood.calories;
    dayProtein += selectedFood.protein;
    dayCarbs += selectedFood.carbs;
    dayFats += selectedFood.fats;
    dayCost += selectedFood.price;
  }

  plan.days[day] = {
    day,
    meals: plannedMeals,
    totalCalories: dayCalories,
    totalProtein: dayProtein,
    totalCarbs: dayCarbs,
    totalFats: dayFats,
    totalCost: dayCost
  };

  const allDays = Object.values(plan.days);
  plan.weeklyTotalCost = allDays.reduce((sum: number, d: any) => sum + d.totalCost, 0);
  plan.averageDailyCalories = Math.round(allDays.reduce((sum: number, d: any) => sum + d.totalCalories, 0) / 7);

  return plan;
}

