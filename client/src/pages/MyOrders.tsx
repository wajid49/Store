import { Link, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { EmptyState, ErrorNotice, Loading } from '../components/Status';
import { StatusBadge } from '../components/StatusBadge';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatDate, formatPrice } from '../lib/format';
import { btn } from '../lib/styles';
import type { Order } from '../types';

export default function MyOrders() {
  usePageTitle('My orders');
  const location = useLocation();
  const justPlaced = (location.state as { placed?: boolean } | null)?.placed === true;
  const { data, error, loading, reload } = useFetch<Order[]>('/orders/mine');

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">My orders</h1>

      {justPlaced && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-leaf-100 p-4 font-medium text-leaf-800">
          <Check size={18} aria-hidden="true" />
          Thank you! Your order was placed. You will pay in cash on delivery.
        </p>
      )}

      <div className="mt-8 space-y-5">
        {loading && <Loading />}
        {error && <ErrorNotice message={error} onRetry={reload} />}
        {data && data.length === 0 && (
          <EmptyState title="No orders yet">
            <Link to="/shop" className={`${btn('primary')} mt-2`}>
              Start shopping
            </Link>
          </EmptyState>
        )}

        {data?.map((order) => (
          <article key={order._id} className="rounded-2xl border border-cream-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-bark-500">Placed on {formatDate(order.createdAt)}</p>
                <p className="text-xs text-bark-500">Order #{order._id.slice(-6).toUpperCase()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <ul className="mt-4 divide-y divide-cream-200 text-sm">
              {order.items.map((item) => (
                <li key={item.product} className="flex justify-between gap-3 py-2">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-bark-700">Delivery</dt>
                <dd>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total (Cash on Delivery)</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
