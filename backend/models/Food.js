const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage']
    },
    image: { type: String, required: true },
    isVeg: { type: Boolean, default: true },
    dietaryType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'eggetarian'],
      default: 'veg'
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    restaurantName: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    portionSize: { type: String, default: '1 serving' },
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    isDietFriendly: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Food || mongoose.model('Food', FoodSchema);
