import { Router } from 'express';
import { z } from 'zod';
import WishlistItem from '../models/WishlistItem.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const addSchema = z.object({ productId: z.string().length(24) });

// GET /api/wishlist
router.get('/', async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ userId: req.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });
    res.json({ items });
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

    const item = await WishlistItem.findOneAndUpdate(
      { userId: req.user.id, productId: data.productId },
      { userId: req.user.id, productId: data.productId },
      { upsert: true, new: true }
    ).populate('productId');

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res, next) => {
  try {
    await WishlistItem.deleteMany({
      userId: req.user.id,
      productId: req.params.productId,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
