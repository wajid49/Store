import { Router } from 'express';
import type { Request } from 'express';
import { isValidObjectId } from 'mongoose';
import { config } from '../config';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { Order, isOrderStatus } from '../models/Order';
import type { IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { asNumber, asString } from '../utils/validate';

const router = Router();

function currentUserId(req: Request): string {
  if (!req.user) throw new AppError(401, 'Please log in to continue.');
  return req.user.id;
}

/** Puts stock back when an order could not be completed or was cancelled. */
async function restock(lines: { productId: unknown; quantity: number }[]): Promise<void> {
  for (const line of lines) {
    await Product.updateOne({ _id: line.productId }, { $inc: { stock: line.quantity } });
  }
}

/** Customer: place an order. Prices always come from the database, never from the browser. */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const rawItems = Array.isArray(body.items) ? (body.items as unknown[]) : [];
    if (rawItems.length === 0 || rawItems.length > 50) throw new AppError(400, 'Your cart is empty.');

    const wanted = new Map<string, number>();
    for (const raw of rawItems) {
      const row = (raw ?? {}) as Record<string, unknown>;
      const productId = asString(row.productId);
      const quantity = asNumber(row.quantity);
      if (!isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new AppError(400, 'One of the cart items is not valid.');
      }
      wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
    }

    const address = (body.shippingAddress ?? {}) as Record<string, unknown>;
    const shippingAddress = {
      fullName: asString(address.fullName),
      phone: asString(address.phone),
      address: asString(address.address),
      city: asString(address.city),
    };
    if (shippingAddress.fullName.length < 2) throw new AppError(400, 'Please enter your full name.');
    if (shippingAddress.phone.length < 7) throw new AppError(400, 'Please enter a valid phone number.');
    if (shippingAddress.address.length < 5) throw new AppError(400, 'Please enter your full address.');
    if (shippingAddress.city.length < 2) throw new AppError(400, 'Please enter your city.');
    if (body.paymentMethod !== 'cod') throw new AppError(400, 'Only Cash on Delivery is available right now.');

    const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
    if (products.length !== wanted.size) {
      throw new AppError(400, 'Some products are no longer available. Please review your cart.');
    }

    // Reserve stock one product at a time. If anything fails, everything reserved is put back.
    const reserved: { productId: unknown; quantity: number }[] = [];
    try {
      const items: IOrderItem[] = [];
      for (const product of products) {
        const quantity = wanted.get(String(product._id)) ?? 0;
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
        );
        if (!updated) throw new AppError(409, `Not enough stock for "${product.name}". Please update your cart.`);
        reserved.push({ productId: product._id, quantity });
        items.push({ product: product._id, name: product.name, price: product.price, quantity });
      }

      const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = itemsTotal >= config.freeShippingOver ? 0 : config.shippingFee;

      const order = await Order.create({
        user: userId,
        items,
        shippingAddress,
        paymentMethod: 'cod',
        itemsTotal,
        shippingFee,
        total: itemsTotal + shippingFee,
      });

      res.status(201).json(order);
    } catch (error) {
      await restock(reserved);
      throw error;
    }
  }),
);

/** Customer: my own orders. */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: currentUserId(req) }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  }),
);

/** Admin: every order. */
router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name email').lean();
    res.json(orders);
  }),
);

/** Admin: change the status of an order. A cancelled order puts its items back in stock. */
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) throw new AppError(404, 'Order not found.');

    const status = asString((req.body as Record<string, unknown> | undefined)?.status);
    if (!isOrderStatus(status)) throw new AppError(400, 'Please choose a valid status.');

    const order = await Order.findById(id);
    if (!order) throw new AppError(404, 'Order not found.');
    if (order.status === 'cancelled') throw new AppError(400, 'A cancelled order cannot be changed.');

    if (status === 'cancelled') {
      await restock(order.items.map((item: IOrderItem) => ({ productId: item.product, quantity: item.quantity })));
    }
    order.status = status;
    await order.save();

    res.json(order);
  }),
);

export default router;
