import { Router } from 'express';
import { z } from 'zod';
import WishlistItem from '../models/WishlistItem.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const addSchema = z.object({ productId: z.string().length(24), color: z.string().optional() });

// GET /api/wishlist
router.get('/', async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ userId: req.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });

    // Same as cart: a wishlist line can outlive the product it points to.
    // Drop orphaned lines (productId: null after populate) and clean them up
    // rather than shipping data that crashes the frontend's adapter.
    const valid = items.filter(item => item.productId);
    if (valid.length !== items.length) {
      const orphanIds = items.filter(item => !item.productId).map(item => item._id);
      await WishlistItem.deleteMany({ _id: { $in: orphanIds } });
    }

    res.json({ items: valid });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist
router.post('/', async (req, res, next) => {
  try {
    const data = addSchema.parse(req.body);

    const product = await Product.findById(data.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const color = data.color || null;
    const item = await WishlistItem.findOneAndUpdate(
      { userId: req.user.id, productId: data.productId, color },
      { userId: req.user.id, productId: data.productId, color },
      { upsert: true, new: true }
    ).populate('productId');

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId?color=...
// Omitting ?color removes every color variant of the product (e.g. Clear Wishlist).
router.delete('/:productId', async (req, res, next) => {
  try {
    const filter = { userId: req.user.id, productId: req.params.productId };
    if (req.query.color !== undefined) filter.color = req.query.color || null;
    await WishlistItem.deleteMany(filter);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
