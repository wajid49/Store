import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react';
import { ProductImage } from '../components/ProductImage';
import { QuantityStepper } from '../components/QuantityStepper';
import { ErrorNotice, Loading } from '../components/Status';
import { categoryLabel } from '../config/store';
import { useCart } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatPrice } from '../lib/format';
import { btn } from '../lib/styles';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const { data: product, error, loading, reload } = useFetch<Product>(id ? `/products/${id}` : null);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  usePageTitle(product?.name ?? 'Product');

  function handleAdd(item: Product) {
    addItem(item, quantity);
    setAdded(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-bark-700 hover:text-leaf-700">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to shop
      </Link>

      {loading && <Loading />}
      {error && (
        <div className="mt-8">
          <ErrorNotice message={error} onRetry={reload} />
        </div>
      )}

      {product && (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-cream-200">
            <ProductImage image={product.image} name={product.name} category={product.category} />
          </div>

          <div>
            <p className="text-sm font-medium text-bark-500">{categoryLabel(product.category)}</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-bark-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-semibold text-leaf-700">{formatPrice(product.price)}</p>

            {product.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-bark-700">{product.description}</p>}

            <p className={`mt-6 text-sm font-medium ${product.stock > 0 ? 'text-leaf-700' : 'text-clay-600'}`}>
              {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </p>

            {product.stock > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <QuantityStepper
                  value={quantity}
                  max={Math.min(product.stock, 99)}
                  onChange={(value) => {
                    setQuantity(value);
                    setAdded(false);
                  }}
                  label="Quantity"
                />
                <button type="button" className={btn('primary')} onClick={() => handleAdd(product)}>
                  <ShoppingBag size={18} aria-hidden="true" />
                  Add to cart
                </button>
              </div>
            )}

            {added && (
              <p role="status" className="mt-4 flex items-center gap-2 text-sm text-leaf-700">
                <Check size={16} aria-hidden="true" />
                Added to your cart.{' '}
                <Link to="/cart" className="font-semibold underline">
                  View cart
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
