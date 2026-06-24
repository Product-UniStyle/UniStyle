import { Router } from 'express';
import { z } from 'zod';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // every cart route requires a logged-in user

const addItemSchema = z.object({
  productId: z.string().length(24),
  quantity: z.number().int().min(1).default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart  - add an item (or increment if same product/size/color exists)
router.post('/', async (req, res, next) => {
  try {
    const data = addItemSchema.parse(req.body);

    const product = await Product.findById(data.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const filter = {
      userId: req.user.id,
      productId: data.productId,
      size: data.size ?? null,
      color: data.color ?? null,
    };

    const existing = await CartItem.findOne(filter);

    const item = existing
      ? await CartItem.findByIdAndUpdate(
          existing._id,
          { quantity: existing.quantity + data.quantity },
          { new: true }
        ).populate('productId')
      : await (await CartItem.create({ userId: req.user.id, ...data })).populate('productId');

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/:itemId  - update quantity
router.patch('/:itemId', async (req, res, next) => {
  try {
    const data = updateItemSchema.parse(req.body);

    const item = await CartItem.findById(req.params.itemId);
    if (!item || item.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    item.quantity = data.quantity;
    await item.save();
    await item.populate('productId');

    res.json({ item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:itemId
router.delete('/:itemId', async (req, res, next) => {
  try {
    const item = await CartItem.findById(req.params.itemId);
    if (!item || item.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart  - clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
