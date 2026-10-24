import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

function numberFrom(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return process.env[name] !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

export const config = {
  port: numberFrom('PORT', 5000),
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  currency: 'PKR',
  shippingFee: numberFrom('SHIPPING_FEE', 200),
  freeShippingOver: numberFrom('FREE_SHIPPING_OVER', 5000),
};
