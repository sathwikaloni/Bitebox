import { Restaurant, Food, User, Order, UserDietProfile, WeeklyDietPlan } from './types.js';
import { seedRestaurants, seedFoods } from './data/seedData.js';

class InMemoryStore {
  restaurants: Restaurant[] = [...seedRestaurants];
  foods: Food[] = [...seedFoods];
  users: Map<string, any> = new Map();
  carts: Map<string, { items: any[]; subtotal: number; deliveryFee: number; total: number }> = new Map();
  orders: Order[] = [];
  dietProfiles: Map<string, UserDietProfile> = new Map();
  dietPlans: Map<string, WeeklyDietPlan> = new Map();

  constructor() {
    // Seed a default demo user
    const demoUser = {
      id: 'demo-user-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      passwordHash: '$2a$10$demoHashBiteBox12345678901234567890',
      phone: '+91 98765 43210',
      address: '404 12th Main, 4th Block, Koramangala, Bengaluru',
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);

    // Seed default demo order
    this.orders.push({
      _id: 'ord-101',
      userId: demoUser.id,
      customerName: demoUser.name,
      customerEmail: demoUser.email,
      customerPhone: demoUser.phone,
      deliveryAddress: demoUser.address,
      items: [
        {
          foodId: 'food-10',
          foodName: 'Grilled Herb Chicken & Sweet Potato Mash',
          price: 349,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
          restaurantName: 'FitProtein Grill & Deli',
          calories: 490,
          protein: 44
        },
        {
          foodId: 'food-18',
          foodName: 'Cold-Pressed Green Glow Detox Juice',
          price: 159,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
          restaurantName: 'Nectar Superfood Cafe',
          calories: 90,
          protein: 2
        }
      ],
      subtotal: 508,
      deliveryFee: 40,
      totalAmount: 548,
      status: 'Delivered',
      paymentMethod: 'UPI / NetBanking',
      paymentStatus: 'Paid',
      isDietPlanOrder: true,
      dietPlanDay: 'Monday',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    });
  }

  // Restaurant methods
  getRestaurants(filters?: { query?: string; cuisine?: string; vegOnly?: boolean }) {
    let result = [...this.restaurants];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        r => r.name.toLowerCase().includes(q) || r.cuisine.some(c => c.toLowerCase().includes(q))
      );
    }
    if (filters?.cuisine && filters.cuisine !== 'All') {
      result = result.filter(r => r.cuisine.some(c => c.toLowerCase().includes(filters.cuisine!.toLowerCase())));
    }
    if (filters?.vegOnly) {
      result = result.filter(r => r.isVeg);
    }
    return result;
  }

  getRestaurantById(id: string) {
    return this.restaurants.find(r => r._id === id);
  }

  // Food methods
  getFoods(filters?: { restaurantId?: string; category?: string; query?: string; vegOnly?: boolean }) {
    let result = [...this.foods];
    if (filters?.restaurantId) {
      result = result.filter(f => f.restaurant === filters.restaurantId);
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter(f => f.category === filters.category);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters?.vegOnly) {
      result = result.filter(f => f.isVeg);
    }
    return result;
  }

  getFoodById(id: string) {
    return this.foods.find(f => f._id === id);
  }

  // Cart methods
  getCart(userId: string) {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, { items: [], subtotal: 0, deliveryFee: 40, total: 0 });
    }
    return this.carts.get(userId)!;
  }

  saveCart(userId: string, cart: { items: any[]; subtotal: number; deliveryFee: number; total: number }) {
    this.carts.set(userId, cart);
    return cart;
  }

  // Order methods
  createOrder(orderData: Omit<Order, '_id' | 'createdAt'>) {
    const order: Order = {
      ...orderData,
      _id: 'ord-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(order);
    return order;
  }

  getOrders(userId?: string) {
    if (userId) {
      return this.orders.filter(o => o.userId === userId);
    }
    return this.orders;
  }

  getOrderById(id: string) {
    return this.orders.find(o => o._id === id);
  }

  updateOrderStatus(id: string, status: Order['status']) {
    const order = this.orders.find(o => o._id === id);
    if (order) {
      order.status = status;
    }
    return order;
  }

  // User Diet Profile methods
  saveDietProfile(userId: string, profile: UserDietProfile) {
    this.dietProfiles.set(userId, profile);
    return profile;
  }

  getDietProfile(userId: string) {
    return this.dietProfiles.get(userId) || null;
  }

  // Diet Plan methods
  saveDietPlan(userId: string, plan: WeeklyDietPlan) {
    this.dietPlans.set(userId, plan);
    return plan;
  }

  getDietPlan(userId: string) {
    return this.dietPlans.get(userId) || null;
  }
}

export const db = new InMemoryStore();
