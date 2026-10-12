const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
    deliveryAddress: { type: String, required: true },
    items: [
      {
        foodId: { type: String, required: true },
        foodName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String },
        restaurantName: { type: String },
        calories: { type: Number },
        protein: { type: Number }
      }
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Placed', 'Preparing', 'On the way', 'Delivered', 'Cancelled'],
      default: 'Placed'
    },
    paymentMethod: { type: String, default: 'UPI / NetBanking' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
    isDietPlanOrder: { type: Boolean, default: false },
    dietPlanDay: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
