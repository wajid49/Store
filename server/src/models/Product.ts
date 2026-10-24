import { Schema, model } from 'mongoose';

export const CATEGORIES = ['kitchen', 'home', 'decor'] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: Category;
  /** A full link (https://...) or a path inside the website's public folder (/images/pot.jpg). */
  image: string;
  stock: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: [...CATEGORIES], required: true },
    image: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

export const Product = model<IProduct>('Product', productSchema);
