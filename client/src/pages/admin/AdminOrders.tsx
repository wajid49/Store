import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { EmptyState, ErrorNotice, Loading } from '../../components/Status';
import { StatusBadge } from '../../components/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../lib/api';
import { errorMessage, formatDate, formatPrice } from '../../lib/format';
import { inputClass } from '../../lib/styles';
import { ORDER_STATUSES } from '../../types';
import type { Order, OrderStatus } from '../../types';

function customerOf(order: Order): { name: string; email: string } {
  const user = order.user;
  if (user && typeof user === 'object') return { name: user.name, email: user.email };
  return { name: 'Deleted account', email: '' };
}

export function AdminOrders() {
  const { data, error, loading, reload } = useFetch<Order[]>('/orders');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeStatus(order: Order, event: ChangeEvent<HTMLSelectElement>) {
    const status = event.target.value as OrderStatus;
    if (status === 'cancelled' && !window.confirm('Cancel this order? The items will go back into stock. This cannot be undone.')) {
      return;
    }
    setBusyId(order._id);
    setNotice('');
    try {
      await api.patch(`/orders/${order._id}/status`, { status });
      reload();
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Orders</h2>

      {notice && (
        <p role="alert" className="mt-4 rounded-lg bg-clay-100 px-4 py-3 text-sm font-medium text-clay-600">
          {notice}
        </p>
      )}

      <div className="mt-8 space-y-5">
        {loading && <Loading />}
        {error && <ErrorNotice message={error} onRetry={reload} />}
        {data && data.length === 0 && <EmptyState title="No orders yet">New orders will appear here.</EmptyState>}

        {data?.map((order) => {
          const customer = customerOf(order);
          return (
            <article key={order._id} className="rounded-2xl border border-cream-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    Order #{order._id.slice(-6).toUpperCase()} <span className="font-normal text-bark-500">· {formatDate(order.createdAt)}</span>
                  </p>
                  <p className="mt-1 text-sm text-bark-700">
                    {customer.name}
                    {customer.email && ` (${customer.email})`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <div>
                    <label htmlFor={`status-${order._id}`} className="sr-only">
                      Change status of order {order._id.slice(-6)}
                    </label>
                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      disabled={busyId === order._id || order.status === 'cancelled'}
                      onChange={(event) => changeStatus(order, event)}
                      className={`${inputClass} py-2 capitalize`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Deliver to</p>
                  <p className="mt-1 text-sm text-bark-700">
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.phone}
                    <br />
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Items</p>
                  <ul className="mt-1 space-y-1 text-sm text-bark-700">
                    {order.items.map((item) => (
                      <li key={item.product} className="flex justify-between gap-3">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 flex justify-between border-t border-cream-200 pt-2 text-sm font-semibold">
                    <span>Total (Cash on Delivery)</span>
                    <span>{formatPrice(order.total)}</span>
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
