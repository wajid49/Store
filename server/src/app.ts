import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFound } from './middleware/error';
import authRouter from './routes/auth';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // needed on hosts such as Render so rate limiting sees the real visitor
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Store settings the website needs (delivery charges)
  app.get('/api/config', (_req, res) => {
    res.json({
      currency: config.currency,
      shippingFee: config.shippingFee,
      freeShippingOver: config.freeShippingOver,
    });
  });

  // Limit repeated login/register attempts
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
