import type { Category } from '../types';

/** EDIT THIS FILE to change the store name and category names. */
export const storeConfig = {
  // PLACEHOLDER name: replace it with your real store name (also edit the <title> in index.html)
  name: 'Ghar Bazaar',
  tagline: 'Kitchen items, home essentials and room decor',
  categories: [
    { id: 'kitchen' as Category, label: 'Kitchen Items', description: 'Pots, pans, utensils and storage' },
    { id: 'home' as Category, label: 'Home Essentials', description: 'Everyday things for every room' },
    { id: 'decor' as Category, label: 'Room Decor', description: 'Make your rooms look beautiful' },
  ],
};

export function categoryLabel(id: Category): string {
  return storeConfig.categories.find((category) => category.id === id)?.label ?? id;
}
