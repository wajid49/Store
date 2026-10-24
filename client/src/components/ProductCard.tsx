import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { categoryLabel } from '../config/store';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { btn } from '../lib/styles';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = product.stock < 1;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white transition-shadow hover:shadow-lg hover:shadow-bark-900/5">
      <Link to={`/product/${product._id}`} className="block overflow-hidden" aria-label={`View ${product.name}`}>
        <ProductImage
          image={product.image}
          name={product.name}
          category={product.category}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-bark-500">{categoryLabel(product.category)}</p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-bark-900">
          <Link to={`/product/${product._id}`} className="hover:text-leaf-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="font-semibold text-bark-900">{formatPrice(product.price)}</p>
          {soldOut ? (
            <span className="text-sm font-medium text-clay-600">Out of stock</span>
          ) : (
            <button
              type="button"
              className={btn('primary', 'sm')}
              onClick={() => addItem(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} aria-hidden="true" />
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
