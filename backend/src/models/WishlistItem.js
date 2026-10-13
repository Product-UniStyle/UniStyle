import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // Absent/null means "the product in general" (no specific color variant).
  // Part of the uniqueness key so each color of a product can be wishlisted
  // independently — see migrateWishlistColor.js for the index migration.
  color: { type: String, default: null },
}, { timestamps: true });

wishlistItemSchema.index({ userId: 1, productId: 1, color: 1 }, { unique: true });

export default mongoose.model('WishlistItem', wishlistItemSchema);
