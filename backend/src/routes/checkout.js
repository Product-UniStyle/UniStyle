import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
});

// POST /api/checkout/create-session
// Reads the user's current cart, creates a pending Order, and either redirects to Stripe
// (when STRIPE_SECRET_KEY is configured) or finalizes the order directly (pre-Stripe stub).
router.post('/create-session', requireAuth, async (req, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);

    const cartItems = await CartItem.find({ userId: req.user.id }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

    // Create a PENDING order first so we have a record even if the user abandons checkout
    const order = await Order.create({
      userId: req.user.id,
      total,
      shippingAddress: data.shippingAddress,
      items: cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.productId.price,
      })),
    });

    if (!stripe) {
      // No Stripe keys configured yet — finalize the order directly so the rest of the
      // app (orders, cart clearing) works end-to-end. Replace with the Stripe branch
      // below once STRIPE_SECRET_KEY is set.
      order.status = 'PAID';
      await order.save();
      await CartItem.deleteMany({ userId: req.user.id });

      return res.json({
        orderId: order.id,
        redirectUrl: `/account?order=success&orderId=${order.id}`,
      });
    }

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productId.name,
          images: item.productId.images?.slice(0, 1) ?? [],
          metadata: { size: item.size ?? '', color: item.color ?? '' },
        },
        unit_amount: item.productId.price, // cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL}/account?order=success&orderId=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: { orderId: order.id, userId: req.user.id },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url, orderId: order.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/checkout/webhook
// Stripe calls this directly. Must use the raw body (configured in server.js).
// This is what actually marks an order PAID and clears the cart — never trust the client for this.
router.post('/webhook', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId, userId } = session.metadata;

    try {
      await Order.findByIdAndUpdate(orderId, { status: 'PAID' });
      // Clear the user's cart now that the order is confirmed paid
      await CartItem.deleteMany({ userId });
    } catch (err) {
      console.error('Failed to finalize order after payment:', err);
    }
  }

  res.json({ received: true });
});

export default router;
