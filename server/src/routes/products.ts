import { Router, type Request } from 'express';
import { isValidObjectId } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { Product, isCategory } from '../models/Product';
import type { IProduct } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { asNumber, asString, escapeRegex } from '../utils/validate';

const router = Router();

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
};

/** Checks the product form data sent by the admin and returns clean values. */
function parseProduct(body: unknown): IProduct {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = asString(b.name);
  const description = asString(b.description);
  const image = asString(b.image);
  const category = asString(b.category);
  const price = asNumber(b.price);
  const stock = asNumber(b.stock);

  if (name.length < 2 || name.length > 120) throw new AppError(400, 'Product name must be 2 to 120 characters.');
  if (!isCategory(category)) throw new AppError(400, 'Please choose a valid category.');
  if (!Number.isFinite(price) || price < 0) throw new AppError(400, 'Price must be a number, 0 or more.');
  if (!Number.isInteger(stock) || stock < 0) throw new AppError(400, 'Stock must be a whole number, 0 or more.');
  if (description.length > 2000) throw new AppError(400, 'Description is too long (2000 characters max).');
  if (image && !/^(https?:\/\/|\/)/.test(image)) {
    throw new AppError(400, 'Image must be a full link (https://...) or a path starting with /.');
  }

  return { name, description, price, category, image, stock };
}

function idParam(req: Request): string {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new AppError(404, 'Product not found.');
  return id;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit)) || 12));

    const filter: FilterQuery<IProduct> = {};
    const category = asString(req.query.category);
    if (isCategory(category)) filter.category = category;

    const search = asString(req.query.search);
    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: 'i' };
      filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const sort = SORTS[asString(req.query.sort)] ?? SORTS.newest;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(idParam(req)).lean();
    if (!product) throw new AppError(404, 'Product not found.');
    res.json(product);
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.create(parseProduct(req.body));
    res.status(201).json(product);
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(idParam(req), parseProduct(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) throw new AppError(404, 'Product not found.');
    res.json(product);
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(idParam(req));
    if (!product) throw new AppError(404, 'Product not found.');
    res.json({ message: 'Product deleted.' });
  }),
);

export default router;
