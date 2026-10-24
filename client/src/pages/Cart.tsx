import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ProductImage } from '../components/ProductImage';
import { QuantityStepper } from '../components/QuantityStepper';
import { EmptyState } from '../components/Status';
import { useCart } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatPrice } from '../lib/format';
import { btn } from '../lib/styles';
import type { StoreSettings } from '../types';

export default function Cart() {
  usePageTitle('Cart');
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const { data: settings } = useFetch<StoreSettings>('/config');

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <EmptyState title="Your cart is empty">
          <Link to="/shop" className={`${btn('primary')} mt-2`}>
            Start shopping
          </Link>
        </EmptyState>
      </div>
    );
  }

  const shipping = settings ? (subtotal >= settings.freeShippingOver ? 0 : settings.shippingFee) : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 rounded-2xl border border-cream-200 bg-white p-4">
              <Link to={`/product/${item.productId}`} className="block w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
                <ProductImage image={item.image} name={item.name} category={item.category} />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/product/${item.productId}`} className="font-display text-lg font-semibold leading-snug hover:text-leaf-700">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="rounded-md p-2 text-bark-500 hover:bg-clay-100 hover:text-clay-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-bark-500">{formatPrice(item.price)} each</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QuantityStepper
                    value={item.quantity}
                    max={Math.min(item.stock, 99)}
                    onChange={(value) => setQuantity(item.productId, value)}
                    label={`Quantity of ${item.name}`}
                  />
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-cream-200 bg-white p-6" aria-label="Order summary">
          <h2 className="font-display text-xl font-semibold">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-bark-700">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bark-700">Delivery</dt>
              <dd className="font-medium">
                {shipping === null ? 'Shown at checkout' : shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            {shipping !== null && (
              <div className="flex justify-between border-t border-cream-200 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">{formatPrice(subtotal + shipping)}</dd>
              </div>
            )}
          </dl>
          {settings && shipping !== null && shipping > 0 && (
            <p className="mt-3 text-sm text-bark-500">Free delivery on orders over {formatPrice(settings.freeShippingOver)}.</p>
          )}
          <Link to="/checkout" className={`${btn('primary')} mt-6 w-full`}>
            Checkout
          </Link>
          <p className="mt-3 text-center text-sm text-bark-500">Payment: Cash on Delivery</p>
        </aside>
      </div>
    </div>
  );
}
