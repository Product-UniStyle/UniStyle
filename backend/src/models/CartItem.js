import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  size: String,
  color: String,
}, { timestamps: true });

cartItemSchema.index({ userId: 1, productId: 1, size: 1, color: 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema);
