import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  addresses: [addressSchema],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
