const mongoose = require('mongoose');

const DietProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'maintenance', 'muscle_gain', 'healthy_eating'],
      default: 'weight_loss'
    },
    dietaryPreference: {
      type: String,
      enum: ['vegetarian', 'vegan', 'non_vegetarian', 'eggetarian'],
      default: 'vegetarian'
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      default: 'moderately_active'
    },
    allergies: [{ type: String }],
    dislikedFoods: [{ type: String }],
    preferredCuisine: { type: String, default: 'All' },
    mealsPerDay: { type: Number, default: 5 },
    dailyBudget: { type: Number, default: 650 },
    dietaryRestrictions: [{ type: String }],
    bmr: { type: Number },
    tdee: { type: Number },
    targetCalories: { type: Number },
    targetProtein: { type: Number },
    targetCarbs: { type: Number },
    targetFats: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.models.DietProfile || mongoose.model('DietProfile', DietProfileSchema);
