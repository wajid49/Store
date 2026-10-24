import type { NextFunction, Request, Response } from 'express';

/** An error with a safe message and an HTTP status code. */
export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000) {
    res.status(409).json({ message: 'That value already exists.' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}
