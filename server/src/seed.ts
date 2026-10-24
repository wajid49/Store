/**
 * Run with: npm run seed
 * 1. Creates your admin account (from ADMIN_EMAIL and ADMIN_PASSWORD in .env).
 * 2. Adds SAMPLE products, but only if the store has no products yet.
 * The sample names, prices and stock are only examples. Replace them from the Admin page.
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from './config';
import { Product } from './models/Product';
import type { IProduct } from './models/Product';
import { User } from './models/User';

const samples: Pick<IProduct, 'name' | 'description' | 'price' | 'category' | 'stock'>[] = [
  { name: 'Stainless Steel Cooking Pot', description: 'A sturdy steel pot with a lid for everyday cooking.', price: 2400, category: 'kitchen', stock: 20 },
  { name: 'Non-Stick Frying Pan', description: 'Non-stick pan for frying and shallow cooking.', price: 1800, category: 'kitchen', stock: 25 },
  { name: 'Steel Spoon and Spatula Set', description: 'A set of kitchen spoons and spatulas.', price: 950, category: 'kitchen', stock: 40 },
  { name: 'Glass Storage Jar Set', description: 'Airtight glass jars for spices, pulses and snacks.', price: 1500, category: 'kitchen', stock: 30 },
  { name: 'Dinner Plate Set', description: 'A set of plates for the family dining table.', price: 3200, category: 'kitchen', stock: 15 },
  { name: 'Plastic Storage Basket', description: 'A basket for organising the kitchen and store room.', price: 650, category: 'home', stock: 50 },
  { name: 'Laundry Bag', description: 'A foldable bag for dirty clothes.', price: 700, category: 'home', stock: 35 },
  { name: 'Cotton Hand Towel Set', description: 'Soft cotton towels for the kitchen and bathroom.', price: 1100, category: 'home', stock: 45 },
  { name: 'Cleaning Mop and Bucket', description: 'Mop with bucket for floor cleaning.', price: 2100, category: 'home', stock: 18 },
  { name: 'Decorative Wall Clock', description: 'A simple wall clock for the living room or bedroom.', price: 2600, category: 'decor', stock: 12 },
  { name: 'Ceramic Flower Vase', description: 'A ceramic vase to decorate a table or shelf.', price: 1900, category: 'decor', stock: 16 },
  { name: 'Cushion Cover Pair', description: 'Two cushion covers to refresh your room.', price: 1300, category: 'decor', stock: 28 },
];

async function seed(): Promise<void> {
  await mongoose.connect(config.mongoUri);

  const adminEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';

  if (adminEmail && adminPassword.length >= 8) {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing account ${adminEmail} is now an admin.`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: 'Store Admin', email: adminEmail, passwordHash, role: 'admin' });
      console.log(`Admin account created: ${adminEmail}`);
    }
  } else {
    console.log('Skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in .env first.');
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(samples.map((product) => ({ ...product, image: '' })));
    console.log(`Added ${samples.length} sample products. Replace them from the Admin page.`);
  } else {
    console.log('Products already exist, so no sample products were added.');
  }

  await mongoose.disconnect();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
