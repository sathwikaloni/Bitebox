import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { calculateMetrics, generateWeeklyDietPlan, findSwapAlternatives, regenerateSingleDayPlan } from './server/dietEngine.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Request helper for user auth identification
function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
  }
  const customUser = req.headers['x-user-id'];
  if (typeof customUser === 'string' && customUser) {
    return customUser;
  }
  return 'demo-user-1';
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES (/api/auth)
// ----------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.users.get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: 'user-' + Date.now().toString(36),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: 'hashed_' + password,
    phone: phone || '',
    address: address || '',
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  db.users.set(newUser.id, newUser);
  db.users.set(newUser.email, newUser);

  res.status(201).json({
    message: 'Registration successful',
    token: newUser.id,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simple password check for existing users / demo
  if (user.passwordHash !== 'hashed_' + password && !user.passwordHash.startsWith('$2a$')) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address
    }
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.users.get(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    }
  });
});

// ----------------------------------------------------
// RESTAURANT ROUTES (/api/restaurants)
// ----------------------------------------------------
app.get('/api/restaurants', (req: Request, res: Response) => {
  const query = typeof req.query.query === 'string' ? req.query.query : undefined;
  const cuisine = typeof req.query.cuisine === 'string' ? req.query.cuisine : undefined;
  const vegOnly = req.query.vegOnly === 'true';

  const restaurants = db.getRestaurants({ query, cuisine, vegOnly });
  res.json(restaurants);
});

app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const restaurant = db.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  res.json(restaurant);
});

// ----------------------------------------------------
// FOOD / MENU ROUTES (/api/food)
// ----------------------------------------------------
app.get('/api/food', (req: Request, res: Response) => {
  const restaurantId = typeof req.query.restaurantId === 'string' ? req.query.restaurantId : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const query = typeof req.query.query === 'string' ? req.query.query : undefined;
  const vegOnly = req.query.vegOnly === 'true';

  const foods = db.getFoods({ restaurantId, category, query, vegOnly });
  res.json(foods);
});

app.get('/api/food/:id', (req: Request, res: Response) => {
  const food = db.getFoodById(req.params.id);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  res.json(food);
});

app.get('/api/food/restaurant/:restaurantId', (req: Request, res: Response) => {
  const foods = db.getFoods({ restaurantId: req.params.restaurantId });
  res.json(foods);
});

// ----------------------------------------------------
// CART ROUTES (/api/cart)
// ----------------------------------------------------
app.get('/api/cart', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const cart = db.getCart(userId);
  res.json(cart);
});

app.post('/api/cart/add', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { foodId, quantity = 1 } = req.body;
  if (!foodId) {
    return res.status(400).json({ error: 'foodId is required' });
  }

  const food = db.getFoodById(foodId);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  const cart = db.getCart(userId);
  const existingIndex = cart.items.findIndex(item => item.food._id === foodId);

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
    cart.items[existingIndex].price = food.price * cart.items[existingIndex].quantity;
  } else {
    cart.items.push({
      food,
      quantity,
      price: food.price * quantity
    });
  }

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  cart.deliveryFee = cart.subtotal > 0 ? (cart.subtotal >= 499 ? 0 : 40) : 0;
  cart.total = cart.subtotal + cart.deliveryFee;

  db.saveCart(userId, cart);
  res.json(cart);
});

// Batch add: Allows "Order Today's Diet Plan" in 1 click!
app.post('/api/cart/batch-add', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { items } = req.body; // array of { foodId, quantity }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const cart = db.getCart(userId);

  for (const item of items) {
    const food = db.getFoodById(item.foodId);
    if (!food) continue;
    const qty = item.quantity || 1;

    const existingIndex = cart.items.findIndex(ci => ci.food._id === food._id);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
      cart.items[existingIndex].price = food.price * cart.items[existingIndex].quantity;
    } else {
      cart.items.push({
        food,
        quantity: qty,
        price: food.price * qty
      });
    }
  }

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  cart.deliveryFee = cart.subtotal > 0 ? (cart.subtotal >= 499 ? 0 : 40) : 0;
  cart.total = cart.subtotal + cart.deliveryFee;

  db.saveCart(userId, cart);
  res.json({
    message: `${items.length} diet plan meals added to cart!`,
    cart
  });
});

app.put('/api/cart/update', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { foodId, quantity } = req.body;

  const cart = db.getCart(userId);
  const itemIndex = cart.items.findIndex(item => item.food._id === foodId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = cart.items[itemIndex].food.price * quantity;
  }

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  cart.deliveryFee = cart.subtotal > 0 ? (cart.subtotal >= 499 ? 0 : 40) : 0;
  cart.total = cart.subtotal + cart.deliveryFee;

  db.saveCart(userId, cart);
  res.json(cart);
});

app.delete('/api/cart/remove/:foodId', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const cart = db.getCart(userId);
  cart.items = cart.items.filter(item => item.food._id !== req.params.foodId);
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  cart.deliveryFee = cart.subtotal > 0 ? (cart.subtotal >= 499 ? 0 : 40) : 0;
  cart.total = cart.subtotal + cart.deliveryFee;

  db.saveCart(userId, cart);
  res.json(cart);
});

app.delete('/api/cart/clear', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const cart = { items: [], subtotal: 0, deliveryFee: 0, total: 0 };
  db.saveCart(userId, cart);
  res.json(cart);
});

// ----------------------------------------------------
// ORDER ROUTES (/api/orders)
// ----------------------------------------------------
app.post('/api/orders', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const {
    items,
    deliveryAddress,
    customerName,
    customerPhone,
    paymentMethod = 'UPI / NetBanking',
    isDietPlanOrder = false,
    dietPlanDay = ''
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cannot place empty order' });
  }

  if (!deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  const order = db.createOrder({
    userId,
    customerName: customerName || 'BiteBox Customer',
    customerPhone: customerPhone || '+91 98765 43210',
    deliveryAddress,
    items,
    subtotal,
    deliveryFee,
    totalAmount,
    status: 'Placed',
    paymentMethod,
    paymentStatus: 'Paid',
    isDietPlanOrder,
    dietPlanDay
  });

  // Clear user's cart on order placement
  db.saveCart(userId, { items: [], subtotal: 0, deliveryFee: 0, total: 0 });

  // If this is a diet plan order, mark today's meals as 'ordered'
  const plan = db.getDietPlan(userId);
  if (plan) {
    const targetDay = dietPlanDay || order.dietPlanDay;
    if (targetDay && (plan.days as any)[targetDay]) {
      const dayPlan = (plan.days as any)[targetDay];
      const orderedFoodIds = new Set(items.map((it: any) => it.foodId));
      for (const meal of dayPlan.meals) {
        if (orderedFoodIds.has(meal.food._id) && meal.status === 'planned') {
          meal.status = 'ordered';
        }
      }
      db.saveDietPlan(userId, plan);
    }
  }

  res.status(201).json({
    message: 'Order placed successfully',
    order
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const orders = db.getOrders(userId);
  res.json(orders);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const order = db.updateOrderStatus(req.params.id, status);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// ----------------------------------------------------
// USER PROFILE ROUTE (/api/user/profile)
// ----------------------------------------------------
app.get('/api/user/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.users.get(userId);
  const dietProfile = db.getDietProfile(userId);
  const orders = db.getOrders(userId);

  res.json({
    user: user || { id: userId, name: 'Guest User', email: '' },
    dietProfile,
    orderCount: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0)
  });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, phone, address } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  db.users.set(userId, user);
  res.json({ message: 'Profile updated', user });
});

// ----------------------------------------------------
// BITEBOX SMART DIET PLANNER ROUTES (/api/diet)
// ----------------------------------------------------

// 1. Calculate & Save Diet Profile
app.post('/api/diet/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profileData = req.body;

  if (!profileData.age || !profileData.weight || !profileData.height) {
    return res.status(400).json({ error: 'Age, weight, and height are required for accurate macro targets' });
  }

  const metrics = calculateMetrics(profileData);
  const fullProfile = {
    ...profileData,
    ...metrics
  };

  db.saveDietProfile(userId, fullProfile);
  res.json({
    message: 'Diet profile saved successfully',
    profile: fullProfile
  });
});

app.get('/api/diet/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = db.getDietProfile(userId);
  if (!profile) {
    // Return default sensible preset
    const defaultProfile = {
      age: 26,
      gender: 'male' as const,
      height: 175,
      weight: 72,
      fitnessGoal: 'weight_loss' as const,
      dietaryPreference: 'vegetarian' as const,
      activityLevel: 'moderately_active' as const,
      allergies: [],
      dislikedFoods: [],
      preferredCuisine: 'All',
      mealsPerDay: 5,
      dailyBudget: 650,
      dietaryRestrictions: []
    };
    const metrics = calculateMetrics(defaultProfile);
    return res.json({ profile: { ...defaultProfile, ...metrics } });
  }
  res.json({ profile });
});

// 2. Generate 7-day Diet Plan using REAL menu items
app.post('/api/diet/generate-plan', (req: Request, res: Response) => {
  const userId = getUserId(req);
  let profile = req.body;

  if (!profile.age || !profile.weight || !profile.height) {
    const saved = db.getDietProfile(userId);
    if (saved) {
      profile = saved;
    } else {
      return res.status(400).json({ error: 'Please provide age, weight, and height to generate your diet plan' });
    }
  }

  const weeklyPlan = generateWeeklyDietPlan(profile);
  db.saveDietPlan(userId, weeklyPlan);
  db.saveDietProfile(userId, weeklyPlan.profile);

  res.json({
    message: 'Weekly diet plan generated successfully from BiteBox menu',
    plan: weeklyPlan
  });
});

// 3. Get Current Active Diet Plan
app.get('/api/diet/current-plan', (req: Request, res: Response) => {
  const userId = getUserId(req);
  let plan = db.getDietPlan(userId);

  if (!plan) {
    // Generate one automatically with default profile
    let profile = db.getDietProfile(userId);
    if (!profile) {
      const defaultProfile = {
        age: 26,
        gender: 'male' as const,
        height: 175,
        weight: 72,
        fitnessGoal: 'healthy_eating' as const,
        dietaryPreference: 'vegetarian' as const,
        activityLevel: 'moderately_active' as const,
        allergies: [],
        dislikedFoods: [],
        preferredCuisine: 'All',
        mealsPerDay: 5,
        dailyBudget: 650,
        dietaryRestrictions: []
      };
      profile = { ...defaultProfile, ...calculateMetrics(defaultProfile) };
      db.saveDietProfile(userId, profile);
    }
    plan = generateWeeklyDietPlan(profile);
    db.saveDietPlan(userId, plan);
  }

  res.json({ plan });
});

// 3b. Regenerate a Single Day's Recommendations
app.post('/api/diet/regenerate-day', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { day } = req.body;

  let plan = db.getDietPlan(userId);
  if (!plan) {
    return res.status(404).json({ error: 'No active diet plan found' });
  }

  if (!day || !(plan.days as any)[day]) {
    return res.status(400).json({ error: 'Valid day name required (e.g. Monday)' });
  }

  const updatedPlan = regenerateSingleDayPlan(plan, day as any);
  db.saveDietPlan(userId, updatedPlan);

  res.json({
    message: `${day}'s meal recommendations regenerated from BiteBox menu!`,
    dayPlan: updatedPlan.days[day as keyof typeof updatedPlan.days],
    plan: updatedPlan
  });
});

// 4. Meal Swap Options (find alternatives from the menu)
app.post('/api/diet/swap-options', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { foodId, mealType } = req.body;

  if (!foodId || !mealType) {
    return res.status(400).json({ error: 'foodId and mealType are required' });
  }

  const profile = db.getDietProfile(userId) || {
    age: 26,
    gender: 'male',
    height: 175,
    weight: 72,
    fitnessGoal: 'healthy_eating',
    dietaryPreference: 'vegetarian',
    activityLevel: 'moderately_active',
    allergies: [],
    dislikedFoods: [],
    preferredCuisine: 'All',
    mealsPerDay: 5,
    dailyBudget: 600,
    dietaryRestrictions: []
  };

  const swapData = findSwapAlternatives(foodId, mealType, profile);
  res.json(swapData);
});

// 5. Swap Meal in Current Plan
app.post('/api/diet/swap-meal', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { day, mealId, newFoodId } = req.body;

  const plan = db.getDietPlan(userId);
  if (!plan) {
    return res.status(404).json({ error: 'No active diet plan found' });
  }

  const dayPlan = (plan.days as any)[day];
  if (!dayPlan) {
    return res.status(400).json({ error: 'Invalid day' });
  }

  const targetMeal = dayPlan.meals.find((m: any) => m.id === mealId);
  if (!targetMeal) {
    return res.status(404).json({ error: 'Meal not found in plan' });
  }

  const newFood = db.getFoodById(newFoodId);
  if (!newFood) {
    return res.status(404).json({ error: 'Replacement food item not found' });
  }

  // Swap the food
  targetMeal.food = newFood;

  // Recalculate day totals
  dayPlan.totalCalories = dayPlan.meals.reduce((sum: number, m: any) => sum + m.food.calories, 0);
  dayPlan.totalProtein = dayPlan.meals.reduce((sum: number, m: any) => sum + m.food.protein, 0);
  dayPlan.totalCarbs = dayPlan.meals.reduce((sum: number, m: any) => sum + m.food.carbs, 0);
  dayPlan.totalFats = dayPlan.meals.reduce((sum: number, m: any) => sum + m.food.fats, 0);
  dayPlan.totalCost = dayPlan.meals.reduce((sum: number, m: any) => sum + m.food.price, 0);

  // Recalculate weekly totals
  const allDays = Object.values(plan.days);
  plan.weeklyTotalCost = allDays.reduce((sum: number, d: any) => sum + d.totalCost, 0);
  plan.averageDailyCalories = Math.round(allDays.reduce((sum: number, d: any) => sum + d.totalCalories, 0) / 7);

  db.saveDietPlan(userId, plan);

  res.json({
    message: 'Meal swapped successfully',
    updatedDayPlan: dayPlan,
    plan
  });
});

// 6. Mark Meal as Consumed / Planned / Ordered
app.post('/api/diet/mark-consumed', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { day, mealId, status } = req.body; // status: 'consumed' | 'planned' | 'ordered'

  const plan = db.getDietPlan(userId);
  if (!plan) {
    return res.status(404).json({ error: 'No active diet plan found' });
  }

  const dayPlan = (plan.days as any)[day];
  if (!dayPlan) {
    return res.status(400).json({ error: 'Invalid day' });
  }

  const meal = dayPlan.meals.find((m: any) => m.id === mealId);
  if (!meal) {
    return res.status(404).json({ error: 'Meal not found' });
  }

  meal.status = status;
  if (status === 'consumed') {
    meal.consumedAt = new Date().toISOString();
  } else {
    meal.consumedAt = undefined;
  }

  db.saveDietPlan(userId, plan);

  res.json({
    message: `Meal marked as ${status}`,
    updatedMeal: meal,
    plan
  });
});

// 7. Diet Dashboard Stats
app.get('/api/diet/dashboard', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const plan = db.getDietPlan(userId);
  const profile = db.getDietProfile(userId) || plan?.profile;
  const orders = db.getOrders(userId);

  // Determine current day of week
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = weekdayNames[new Date().getDay()] as any;
  const currentDayKey = todayName === 'Sunday' ? 'Sunday' : todayName;

  const todayPlan = plan?.days ? (plan.days as any)[currentDayKey] : null;

  const plannedCalories = todayPlan?.totalCalories || 0;
  const consumedMeals = todayPlan?.meals?.filter((m: any) => m.status === 'consumed') || [];
  const orderedMeals = todayPlan?.meals?.filter((m: any) => m.status === 'ordered') || [];

  const consumedCalories = consumedMeals.reduce((sum: number, m: any) => sum + m.food.calories, 0);
  const consumedProtein = consumedMeals.reduce((sum: number, m: any) => sum + m.food.protein, 0);
  const consumedCarbs = consumedMeals.reduce((sum: number, m: any) => sum + m.food.carbs, 0);
  const consumedFats = consumedMeals.reduce((sum: number, m: any) => sum + m.food.fats, 0);

  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 120;
  const targetCarbs = profile?.targetCarbs || 220;
  const targetFats = profile?.targetFats || 65;

  const weeklyOrders = orders.filter(o => o.isDietPlanOrder);
  const totalDietExpenditure = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    todayDay: currentDayKey,
    todayPlan,
    targets: {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats
    },
    planned: {
      calories: plannedCalories,
      protein: todayPlan?.totalProtein || 0,
      carbs: todayPlan?.totalCarbs || 0,
      fats: todayPlan?.totalFats || 0,
      cost: todayPlan?.totalCost || 0
    },
    consumed: {
      calories: consumedCalories,
      protein: consumedProtein,
      carbs: consumedCarbs,
      fats: consumedFats,
      count: consumedMeals.length,
      totalMeals: todayPlan?.meals?.length || 0
    },
    orderedCount: orderedMeals.length,
    weeklyTotalCost: plan?.weeklyTotalCost || 0,
    totalDietExpenditure,
    dietOrderCount: weeklyOrders.length
  });
});

// 8. Safe AI Nutrition Insights (optional with Gemini, fallback deterministic)
app.post('/api/diet/ai-insights', async (req: Request, res: Response) => {
  const { goal, preference, targetCalories, allergies } = req.body;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are BiteBox's certified clinical sports nutritionist. Provide a concise, highly motivating 3-bullet personalized advice for someone with goal: ${goal}, preference: ${preference}, target calories: ${targetCalories} kcal, allergies: ${allergies?.join(', ') || 'none'}. Format as 3 crisp bullet points focusing on hydration, timing, and recovery. Do not include disclaimers or greetings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        source: 'ai',
        insights: response.text?.split('\n').filter((l: string) => l.trim().length > 0) || []
      });
    } catch (err: any) {
      console.error('Gemini API call failed, falling back to deterministic insights:', err?.message);
    }
  }

  // Deterministic fallback (safe, science-backed nutritional advice)
  const fallbackInsights = [
    `Eat your protein-rich meals within 60-90 minutes of high activity to maximize muscle protein synthesis and satiety.`,
    `Hydration directly impacts metabolic rate: aim for 3.0 to 3.5 Liters of water daily, drinking 500ml before your largest meal.`,
    `Consistent meal timing across your ${preference || 'selected'} diet keeps insulin sensitivity optimal and prevents late-night cravings.`
  ];

  res.json({
    source: 'deterministic',
    insights: fallbackInsights
  });
});

// ----------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS HOSTING
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BiteBox] Server running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start BiteBox server:', err);
});
