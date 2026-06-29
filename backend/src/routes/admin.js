import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendStaffCredentials } from '../lib/mailer.js';

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

// POST /api/admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.role !== 'admin' && user.role !== 'editor') {
      return res.status(403).json({ error: 'You do not have panel access' });
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

// GET /api/admin/users — list admin/editor users (admin only)
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find(
      { role: { $in: ['admin', 'editor'] } },
      { passwordHash: 0, __v: 0, addresses: 0, preferences: 0 }
    ).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users — create admin or editor user (admin only)
router.post('/users', requireAdmin, async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-passwordHash -__v -addresses -preferences' }
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

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
