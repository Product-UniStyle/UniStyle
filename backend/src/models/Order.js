import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  size: String,
  color: String,
  price: { type: Number, required: true }, // cents, price at time of purchase
}, { _id: false });

const addressSnapshotSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING',
  },
  total: { type: Number, required: true }, // cents
  stripeSessionId: { type: String, unique: true, sparse: true },
  shippingAddress: { type: addressSnapshotSchema, required: true },
  items: { type: [orderItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
