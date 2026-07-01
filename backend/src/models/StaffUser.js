import mongoose from 'mongoose';

const staffUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], required: true },
  firstName: String,
  lastName: String,
}, { timestamps: true });

export default mongoose.model('StaffUser', staffUserSchema);
