const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bitebox';

const Restaurant = require('./models/Restaurant');
const Food = require('./models/Food');
const User = require('./models/User');

const sampleRestaurants = [
  {
    name: 'GreenLeaf Kitchen & Bowls',
    description: 'Clean, nutrient-dense organic grain bowls, fresh smoothie jars, and wholesome macro-counted salads.',
    address: '42 Indiranagar 100ft Road, Bengaluru',
    cuisine: ['Healthy Bowls', 'Salads', 'Continental', 'Vegan Friendly'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    ratingCount: 1420,
    deliveryTime: '20-25 mins',
    priceForTwo: 550,
    isVeg: true,
    isOpen: true
  },
  {
    name: 'FitProtein Grill & Deli',
    description: 'Chef-crafted high-protein grilled meats, egg specials, paneer steaks, and low-carb keto delights.',
    address: '18 Koramangala 5th Block, Bengaluru',
    cuisine: ['High Protein', 'Keto', 'Grill', 'Continental'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    rating: 4.7,
    ratingCount: 980,
    deliveryTime: '25-30 mins',
    priceForTwo: 650,
    isVeg: false,
    isOpen: true
  },
  {
    name: 'Dosa & Grain Culture',
    description: 'Traditional South Indian culinary heritage reimagined with millets, ragi, sprouts, and cold-pressed oils.',
    address: '89 Jayanagar 4th T Block, Bengaluru',
    cuisine: ['South Indian', 'Millets', 'Breakfast', 'Healthy'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    ratingCount: 2310,
    deliveryTime: '15-20 mins',
    priceForTwo: 350,
    isVeg: true,
    isOpen: true
  },
  {
    name: 'Punjabi Rasoi & Hearth',
    description: 'Authentic homestyle North Indian curries, dal makhani, high-protein paneer bhurji, and tandoori roasts.',
    address: '12 HSR Layout Sector 3, Bengaluru',
    cuisine: ['North Indian', 'Tandoor', 'Homestyle'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80',
    rating: 4.6,
    ratingCount: 1840,
    deliveryTime: '30-35 mins',
    priceForTwo: 500,
    isVeg: false,
    isOpen: true
  },
  {
    name: 'Zen Asian Wok & Steams',
    description: 'Clean steamed dumplings, miso broths, edamame bowls, tofu stir-fries, and teriyaki glazed bowls.',
    address: '77 Whitefield Main Road, Bengaluru',
    cuisine: ['Asian', 'Dim Sum', 'Japanese', 'Healthy'],
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80',
    rating: 4.7,
    ratingCount: 860,
    deliveryTime: '25-30 mins',
    priceForTwo: 700,
    isVeg: false,
    isOpen: true
  },
  {
    name: 'Nectar Superfood Cafe',
    description: 'Refreshing acai bowls, organic chia puddings, roasted seed trail mixes, and zero-sugar protein shakes.',
    address: '25 Lavelle Road, Bengaluru',
    cuisine: ['Smoothies', 'Bowls', 'Snacks', 'Vegan'],
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    ratingCount: 1120,
    deliveryTime: '15-25 mins',
    priceForTwo: 450,
    isVeg: true,
    isOpen: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB at ' + MONGO_URI);

    await Restaurant.deleteMany({});
    await Food.deleteMany({});
    await User.deleteMany({});

    // Create demo user
    await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      phone: '+91 98765 43210',
      address: '404 12th Main, 4th Block, Koramangala, Bengaluru',
      role: 'customer'
    });

    console.log('[Seed] Database seeded with demo user and restaurants!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seed();
