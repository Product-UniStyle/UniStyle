import mongoose from 'mongoose';

const stockLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  change: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, default: '' },
  updatedBy: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('StockLog', stockLogSchema);
