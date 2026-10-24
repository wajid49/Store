import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Lets us use async/await in routes: any error is passed to the error handler. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
