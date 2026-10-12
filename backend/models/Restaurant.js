const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: [{ type: String }],
    image: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 100 },
    deliveryTime: { type: String, default: '25-30 mins' },
    priceForTwo: { type: Number, default: 500 },
    isVeg: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
