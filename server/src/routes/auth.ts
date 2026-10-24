import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { User } from '../models/User';
import type { IUser } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { asString } from '../utils/validate';

const router = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user: IUser & { _id: unknown }) {
  return { _id: String(user._id), name: user.name, email: user.email, role: user.role };
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = asString(body.name);
    const email = asString(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2) throw new AppError(400, 'Please enter your name.');
    if (!EMAIL_PATTERN.test(email)) throw new AppError(400, 'Please enter a valid email address.');
    if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters.');
    if (await User.exists({ email })) throw new AppError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'customer' });

    res.status(201).json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = asString(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    const user = await User.findOne({ email });
    const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !matches) throw new AppError(401, 'Incorrect email or password.');

    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError(401, 'Please log in again.');
    res.json({ user: publicUser(user) });
  }),
);

export default router;
