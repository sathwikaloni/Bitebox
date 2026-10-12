import {
  Restaurant,
  Food,
  Cart,
  Order,
  UserDietProfile,
  WeeklyDietPlan,
  DayDietPlan,
  PlannedMeal
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('bitebox_token') || 'demo-user-1';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-user-id': token
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Restaurants
  async getRestaurants(params?: { query?: string; cuisine?: string; vegOnly?: boolean }): Promise<Restaurant[]> {
    const query = new URLSearchParams();
    if (params?.query) query.append('query', params.query);
    if (params?.cuisine) query.append('cuisine', params.cuisine);
    if (params?.vegOnly) query.append('vegOnly', 'true');

    const res = await fetch(`${API_BASE}/restaurants?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    return res.json();
  },

  async getRestaurantById(id: string): Promise<Restaurant> {
    const res = await fetch(`${API_BASE}/restaurants/${id}`);
    if (!res.ok) throw new Error('Restaurant not found');
    return res.json();
  },

  // Food items
  async getFoods(params?: { restaurantId?: string; category?: string; query?: string; vegOnly?: boolean }): Promise<Food[]> {
    const query = new URLSearchParams();
    if (params?.restaurantId) query.append('restaurantId', params.restaurantId);
    if (params?.category) query.append('category', params.category);
    if (params?.query) query.append('query', params.query);
    if (params?.vegOnly) query.append('vegOnly', 'true');

    const res = await fetch(`${API_BASE}/food?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch food items');
    return res.json();
  },

  async getFoodById(id: string): Promise<Food> {
    const res = await fetch(`${API_BASE}/food/${id}`);
    if (!res.ok) throw new Error('Food item not found');
    return res.json();
  },

  // Cart
  async getCart(): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  async addToCart(foodId: string, quantity = 1): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ foodId, quantity })
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    return res.json();
  },

  async batchAddToCart(items: { foodId: string; quantity: number }[]): Promise<{ message: string; cart: Cart }> {
    const res = await fetch(`${API_BASE}/cart/batch-add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error('Failed to batch add to cart');
    return res.json();
  },

  async updateCartItem(foodId: string, quantity: number): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ foodId, quantity })
    });
    if (!res.ok) throw new Error('Failed to update cart item');
    return res.json();
  },

  async removeCartItem(foodId: string): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/remove/${foodId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to remove item');
    return res.json();
  },

  async clearCart(): Promise<Cart> {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear cart');
    return res.json();
  },

  // Orders
  async createOrder(data: {
    items: any[];
    deliveryAddress: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    isDietPlanOrder?: boolean;
    dietPlanDay?: string;
  }): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  // User Profile
  async getUserProfile() {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateUserProfile(data: { name?: string; phone?: string; address?: string }) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Diet Planner
  async getDietProfile(): Promise<{ profile: UserDietProfile }> {
    const res = await fetch(`${API_BASE}/diet/profile`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch diet profile');
    return res.json();
  },

  async saveDietProfile(profile: UserDietProfile): Promise<{ message: string; profile: UserDietProfile }> {
    const res = await fetch(`${API_BASE}/diet/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to save diet profile');
    return res.json();
  },

  async generateDietPlan(profile?: Partial<UserDietProfile>): Promise<{ message: string; plan: WeeklyDietPlan }> {
    const res = await fetch(`${API_BASE}/diet/generate-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile || {})
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate plan');
    }
    return res.json();
  },

  async getCurrentPlan(): Promise<{ plan: WeeklyDietPlan }> {
    const res = await fetch(`${API_BASE}/diet/current-plan`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load current plan');
    return res.json();
  },

  async regenerateDay(day: string): Promise<{ message: string; dayPlan: DayDietPlan; plan: WeeklyDietPlan }> {
    const res = await fetch(`${API_BASE}/diet/regenerate-day`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ day })
    });
    if (!res.ok) throw new Error('Failed to regenerate day');
    return res.json();
  },

  async getSwapOptions(foodId: string, mealType: string): Promise<{ currentFood: Food; alternatives: Food[] }> {
    const res = await fetch(`${API_BASE}/diet/swap-options`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ foodId, mealType })
    });
    if (!res.ok) throw new Error('Failed to find meal alternatives');
    return res.json();
  },

  async swapMeal(day: string, mealId: string, newFoodId: string): Promise<{ message: string; updatedDayPlan: DayDietPlan; plan: WeeklyDietPlan }> {
    const res = await fetch(`${API_BASE}/diet/swap-meal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ day, mealId, newFoodId })
    });
    if (!res.ok) throw new Error('Failed to swap meal');
    return res.json();
  },

  async markMealConsumed(day: string, mealId: string, status: 'consumed' | 'planned' | 'ordered'): Promise<{ message: string; updatedMeal: PlannedMeal; plan: WeeklyDietPlan }> {
    const res = await fetch(`${API_BASE}/diet/mark-consumed`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ day, mealId, status })
    });
    if (!res.ok) throw new Error('Failed to update meal status');
    return res.json();
  },

  async getDietDashboard() {
    const res = await fetch(`${API_BASE}/diet/dashboard`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load diet dashboard');
    return res.json();
  },

  async getAiInsights(data: { goal: string; preference: string; targetCalories: number; allergies?: string[] }) {
    const res = await fetch(`${API_BASE}/diet/ai-insights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to fetch nutrition insights');
    return res.json();
  }
};
