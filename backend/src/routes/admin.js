import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import StaffUser from '../models/StaffUser.js';
import Product from '../models/Product.js';
import StockLog from '../models/StockLog.js';
import Order from '../models/Order.js';
import { requireAdmin, requireEditorOrAdmin } from '../middleware/auth.js';
import { sendStaffCredentials, sendDeliveryOtp } from '../lib/mailer.js';
import { createPresignedUploadUrl } from '../lib/s3.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Temporary password must be at least 6 characters'),
  role: z.enum(['admin', 'editor']),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'customer']),
});

const adjustStockSchema = z.object({
  productId: z.string().min(1),
  change: z.number().int().refine((n) => n !== 0, 'Change cannot be zero'),
  reason: z.string().optional(),
});

const deliveryStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6),
});

// POST /api/admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await StaffUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/upload-url — get a presigned S3 upload URL (editor or admin)
router.post('/upload-url', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { contentType, size } = req.body;
    if (!contentType || !size) {
      return res.status(400).json({ error: 'contentType and size are required' });
    }
    const result = await createPresignedUploadUrl(contentType, size);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Only') || err.message.includes('size')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// GET /api/admin/users — list admin/editor users (admin only)
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const users = await StaffUser.find({}, { passwordHash: 0, __v: 0 }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users — create admin or editor user (admin only)
router.post('/users', requireAdmin, async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await StaffUser.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ error: 'A staff account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await StaffUser.create({
      email: data.email,
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const { passwordHash: _, __v, ...userObj } = user.toObject();

    // send credentials email — non-blocking, failure does not abort the response
    sendStaffCredentials({
      to: data.email,
      firstName: data.firstName,
      role: data.role,
      password: data.password,
    }).catch((err) => console.error('[mailer] failed to send credentials email:', err.message));

    res.status(201).json({ user: userObj });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role — change role (admin only)
router.patch('/users/:id/role', requireAdmin, async (req, res, next) => {
  try {
    const { role } = updateRoleSchema.parse(req.body);

    // prevent admin from demoting themselves
    if (req.adminUser.id === req.params.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const user = await StaffUser.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-passwordHash -__v' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id — remove a staff user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    if (req.adminUser.id === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await StaffUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Staff user not found' });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/inventory/adjust — restock or correct a product's stock, logged (editor or admin)
router.post('/inventory/adjust', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { productId, change, reason } = adjustStockSchema.parse(req.body);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const previousStock = product.stock;
    const newStock = previousStock + change;
    if (newStock < 0) {
      return res.status(400).json({ error: 'Stock cannot go below 0' });
    }

    // shortcut: read-then-write isn't atomic, so two staff adjusting the same
    // product at once could race. Fine for a single-operator admin panel;
    // move to a transaction if concurrent stock edits become common.
    product.stock = newStock;
    await product.save();

    const log = await StockLog.create({
      productId: product._id,
      productName: product.name,
      change,
      previousStock,
      newStock,
      reason: reason || '',
      updatedBy: req.adminUser.email,
    });

    res.json({ product, log });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/inventory/logs?page=&limit=&productId= — recent stock adjustments, newest first (editor or admin)
router.get('/inventory/logs', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId } = req.query;
    const where = productId ? { productId } : {};
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [logs, total] = await Promise.all([
      StockLog.find(where).sort({ createdAt: -1 }).skip(skip).limit(take),
      StockLog.countDocuments(where),
    ]);

    res.json({ logs, total, page: Number(page), limit: take });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders?status= — all store orders with customer + shipping details (editor or admin)
router.get('/orders', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status: String(status) } : {};

    const orders = await Order.find(where)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/delivery-status — update an order's delivery status (editor or admin)
router.patch('/orders/:id/delivery-status', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { status } = deliveryStatusSchema.parse(req.body);

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/orders/:id/send-delivery-otp — email a one-time code to the
// customer so they can verify the delivery in person (editor or admin)
router.post('/orders/:id/send-delivery-otp', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'firstName email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.userId) return res.status(400).json({ error: 'This order has no linked customer account to notify' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    order.deliveryOtpHash = await bcrypt.hash(otp, 10);
    order.deliveryOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await order.save();

    await sendDeliveryOtp({
      to: order.userId.email,
      firstName: order.userId.firstName,
      otp,
      orderId: order._id.toString(),
    });

    res.json({ sent: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/orders/:id/verify-delivery-otp — confirm the code the customer
// read out, then mark the order DELIVERED (editor or admin)
router.post('/orders/:id/verify-delivery-otp', requireEditorOrAdmin, async (req, res, next) => {
  try {
    const { otp } = verifyOtpSchema.parse(req.body);

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.deliveryOtpHash || !order.deliveryOtpExpiresAt) {
      return res.status(400).json({ error: 'No verification code was sent for this order yet' });
    }
    if (order.deliveryOtpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Code expired — send a new one' });
    }

    const valid = await bcrypt.compare(otp, order.deliveryOtpHash);
    if (!valid) return res.status(400).json({ error: 'Incorrect code' });

    order.status = 'DELIVERED';
    order.deliveryVerifiedAt = new Date();
    order.deliveryOtpHash = undefined;
    order.deliveryOtpExpiresAt = undefined;
    await order.save();

    // Stock leaves inventory once delivery is confirmed, not at payment — mirrors
    // the StockLog audit trail used by manual restocks, so it shows in that product's history.
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - item.quantity);
      product.stock = newStock;
      await product.save();

      await StockLog.create({
        productId: product._id,
        productName: product.name,
        change: newStock - previousStock,
        previousStock,
        newStock,
        reason: `Order #${order._id.toString().slice(-6).toUpperCase()} delivered`,
        updatedBy: req.adminUser.email,
      });
    }

    const populated = await Order.findById(order._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId');

    res.json({ order: populated });
  } catch (err) {
    next(err);
  }
});

export default router;
