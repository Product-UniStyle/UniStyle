import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/admin/login
router.post('/login', (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
