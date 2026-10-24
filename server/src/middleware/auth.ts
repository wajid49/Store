import jwt from 'jsonwebtoken';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from '../config';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from './error';

/** Requires a valid login token. Sets req.user for the routes after it. */
export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new AppError(401, 'Please log in to continue.');

  let subject: unknown;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    subject = typeof payload === 'object' ? payload.sub : undefined;
  } catch {
    throw new AppError(401, 'Your session has expired. Please log in again.');
  }
  if (typeof subject !== 'string') throw new AppError(401, 'Please log in again.');

  // The role is read from the database each time, so changes take effect immediately
  const user = await User.findById(subject).select('role');
  if (!user) throw new AppError(401, 'Please log in again.');

  req.user = { id: String(user._id), role: user.role };
  next();
});

/** Use after requireAuth. Only admins can continue. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(new AppError(403, 'Only the store admin can do this.'));
    return;
  }
  next();
}
