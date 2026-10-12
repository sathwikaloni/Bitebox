export type DietaryPreference = 'vegetarian' | 'vegan' | 'non_vegetarian' | 'eggetarian';
export type FitnessGoal = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'healthy_eating';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type MealType = 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
export type MealStatus = 'planned' | 'ordered' | 'consumed';
export type OrderStatus = 'Placed' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  createdAt?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  cuisine: string[];
  image: string;
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  priceForTwo: number;
  isVeg: boolean;
  isOpen?: boolean;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage';
  image: string;
  isVeg: boolean;
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'eggetarian';
  restaurant: string;
  restaurantName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portionSize: string;
  ingredients: string[];
  allergens: string[];
  isDietFriendly: boolean;
  rating: number;
  tags: string[];
}

export interface CartItem {
  food: Food;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderItem {
  foodId: string;
  foodName: string;
  price: number;
  quantity: number;
  image: string;
  restaurantName: string;
  calories?: number;
  protein?: number;
}

export interface Order {
  _id: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  isDietPlanOrder?: boolean;
  dietPlanDay?: string;
  createdAt: string;
}

export interface UserDietProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  activityLevel: ActivityLevel;
  allergies: string[];
  dislikedFoods: string[];
  preferredCuisine: string;
  mealsPerDay: number; // 3, 4, or 5
  dailyBudget: number; // in currency units (INR)
  dietaryRestrictions: string[]; // e.g. 'low_carb', 'high_fiber', 'low_fat'

  // Calculated metrics
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}

export interface PlannedMeal {
  id: string;
  mealType: MealType;
  label: string;
  targetCaloriesRatio: number;
  food: Food;
  status: MealStatus;
  consumedAt?: string;
}

export interface DayDietPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCost: number;
}

export interface WeeklyDietPlan {
  id: string;
  userId?: string;
  profile: UserDietProfile;
  days: {
    [key in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday']: DayDietPlan;
  };
  weeklyTotalCost: number;
  averageDailyCalories: number;
  createdAt: string;
}
