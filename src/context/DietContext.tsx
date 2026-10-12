import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserDietProfile, WeeklyDietPlan, DayDietPlan, PlannedMeal, Food } from '../types';
import { api } from '../services/api';

interface SwapModalState {
  isOpen: boolean;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  meal: PlannedMeal | null;
  alternatives: Food[];
  loading: boolean;
}

interface DashboardStats {
  todayDay: string;
  todayPlan: DayDietPlan | null;
  targets: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
  };
  planned: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    cost: number;
  };
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    count: number;
    totalMeals: number;
  };
  orderedCount: number;
  weeklyTotalCost: number;
  totalDietExpenditure: number;
  dietOrderCount: number;
}

interface DietContextType {
  dietProfile: UserDietProfile | null;
  weeklyPlan: WeeklyDietPlan | null;
  activeDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  setActiveDay: (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday') => void;
  loading: boolean;
  saveProfileAndGenerate: (profile: UserDietProfile) => Promise<WeeklyDietPlan>;
  regenerateDay: (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday') => Promise<void>;
  swapMeal: (day: string, mealId: string, newFoodId: string) => Promise<void>;
  markMealConsumed: (day: string, mealId: string, status: 'consumed' | 'planned' | 'ordered') => Promise<void>;
  swapModal: SwapModalState;
  openSwapModal: (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday', meal: PlannedMeal) => Promise<void>;
  closeSwapModal: () => void;
  dashboardStats: DashboardStats | null;
  refreshDashboard: () => Promise<void>;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const DietProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dietProfile, setDietProfile] = useState<UserDietProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyDietPlan | null>(null);

  // Set initial day to current real day of week
  const getTodayDayName = (): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' => {
    const d = new Date().getDay(); // 0 is Sunday, 1 is Monday
    const map: Record<number, 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    return map[d] || 'Monday';
  };

  const [activeDay, setActiveDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>(getTodayDayName());
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [swapModal, setSwapModal] = useState<SwapModalState>({
    isOpen: false,
    day: 'Monday',
    meal: null,
    alternatives: [],
    loading: false
  });

  const refreshDashboard = useCallback(async () => {
    try {
      const stats = await api.getDietDashboard();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, []);

  useEffect(() => {
    async function initDiet() {
      try {
        const [profRes, planRes] = await Promise.all([
          api.getDietProfile(),
          api.getCurrentPlan()
        ]);
        setDietProfile(profRes.profile);
        setWeeklyPlan(planRes.plan);
        await refreshDashboard();
      } catch (err) {
        console.error('Failed to initialize diet plan:', err);
      } finally {
        setLoading(false);
      }
    }
    initDiet();
  }, [refreshDashboard]);

  const saveProfileAndGenerate = async (profile: UserDietProfile): Promise<WeeklyDietPlan> => {
    setLoading(true);
    try {
      const res = await api.generateDietPlan(profile);
      setDietProfile(res.plan.profile);
      setWeeklyPlan(res.plan);
      await refreshDashboard();
      return res.plan;
    } finally {
      setLoading(false);
    }
  };

  const regenerateDay = async (
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  ) => {
    setLoading(true);
    try {
      const res = await api.regenerateDay(day);
      setWeeklyPlan(res.plan);
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to regenerate day:', err);
    } finally {
      setLoading(false);
    }
  };

  const swapMeal = async (day: string, mealId: string, newFoodId: string) => {
    try {
      const res = await api.swapMeal(day, mealId, newFoodId);
      setWeeklyPlan(res.plan);
      await refreshDashboard();
      closeSwapModal();
    } catch (err) {
      console.error('Failed to swap meal:', err);
    }
  };

  const markMealConsumed = async (day: string, mealId: string, status: 'consumed' | 'planned' | 'ordered') => {
    try {
      const res = await api.markMealConsumed(day, mealId, status);
      setWeeklyPlan(res.plan);
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to mark meal consumed:', err);
    }
  };

  const openSwapModal = async (
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
    meal: PlannedMeal
  ) => {
    setSwapModal({
      isOpen: true,
      day,
      meal,
      alternatives: [],
      loading: true
    });

    try {
      const data = await api.getSwapOptions(meal.food._id, meal.mealType);
      setSwapModal(prev => ({
        ...prev,
        alternatives: data.alternatives,
        loading: false
      }));
    } catch (err) {
      console.error('Failed to load swap alternatives:', err);
      setSwapModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeSwapModal = () => {
    setSwapModal({
      isOpen: false,
      day: 'Monday',
      meal: null,
      alternatives: [],
      loading: false
    });
  };

  return (
    <DietContext.Provider
      value={{
        dietProfile,
        weeklyPlan,
        activeDay,
        setActiveDay,
        loading,
        saveProfileAndGenerate,
        regenerateDay,
        swapMeal,
        markMealConsumed,
        swapModal,
        openSwapModal,
        closeSwapModal,
        dashboardStats,
        refreshDashboard
      }}
    >
      {children}
    </DietContext.Provider>
  );
};

export const useDiet = () => {
  const context = useContext(DietContext);
  if (!context) throw new Error('useDiet must be used within a DietProvider');
  return context;
};
