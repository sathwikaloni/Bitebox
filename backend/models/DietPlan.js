const mongoose = require('mongoose');

const PlannedMealSchema = new mongoose.Schema({
  id: { type: String, required: true },
  mealType: {
    type: String,
    enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'],
    required: true
  },
  label: { type: String, required: true },
  targetCaloriesRatio: { type: Number, default: 0.25 },
  food: { type: Object, required: true },
  status: { type: String, enum: ['planned', 'ordered', 'consumed'], default: 'planned' },
  consumedAt: { type: Date }
});

const DayDietPlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: [PlannedMealSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFats: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 }
});

const DietPlanSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    profile: { type: Object, required: true },
    days: {
      Monday: DayDietPlanSchema,
      Tuesday: DayDietPlanSchema,
      Wednesday: DayDietPlanSchema,
      Thursday: DayDietPlanSchema,
      Friday: DayDietPlanSchema,
      Saturday: DayDietPlanSchema,
      Sunday: DayDietPlanSchema
    },
    weeklyTotalCost: { type: Number, default: 0 },
    averageDailyCalories: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.DietPlan || mongoose.model('DietPlan', DietPlanSchema);
