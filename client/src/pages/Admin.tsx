import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { AdminOrders } from './admin/AdminOrders';
import { AdminProducts } from './admin/AdminProducts';

type Tab = 'products' | 'orders';

export default function Admin() {
  usePageTitle('Admin');
  const [tab, setTab] = useState<Tab>('products');

  const tabClass = (active: boolean) =>
    `rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
      active ? 'bg-leaf-700 text-white' : 'border border-cream-200 bg-white text-bark-700 hover:border-leaf-700'
    }`;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">Store admin</h1>

      <div className="mt-6 flex gap-3" role="group" aria-label="Admin sections">
        <button type="button" className={tabClass(tab === 'products')} aria-pressed={tab === 'products'} onClick={() => setTab('products')}>
          Products
        </button>
        <button type="button" className={tabClass(tab === 'orders')} aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>

      <div className="mt-8">{tab === 'products' ? <AdminProducts /> : <AdminOrders />}</div>
    </div>
  );
}
