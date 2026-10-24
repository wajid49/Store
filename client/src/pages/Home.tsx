import { Link } from 'react-router-dom';
import { ArrowRight, CookingPot, House, Lamp, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmptyState, ErrorNotice, Loading } from '../components/Status';
import { ProductCard } from '../components/ProductCard';
import { storeConfig } from '../config/store';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { btn } from '../lib/styles';
import type { Category, ProductPage } from '../types';

const tiles: Record<Category, { icon: LucideIcon; tint: string }> = {
  kitchen: { icon: CookingPot, tint: 'bg-leaf-100 text-leaf-800' },
  home: { icon: House, tint: 'bg-cream-200 text-bark-900' },
  decor: { icon: Lamp, tint: 'bg-clay-100 text-clay-600' },
};

const steps = [
  { title: 'Choose', text: 'Browse kitchen items, home essentials and room decor, and add what you like to the cart.' },
  { title: 'Order', text: 'Create an account, enter your delivery address and place your order.' },
  { title: 'Pay on delivery', text: 'Pay in cash when your order arrives. Follow its status in My Orders.' },
];

export default function Home() {
  usePageTitle('');
  const { data, error, loading, reload } = useFetch<ProductPage>('/products?limit=8&sort=newest');

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-bark-900 sm:text-5xl">
            Everything for your kitchen and home
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-bark-700">
            {storeConfig.tagline}. Order online and pay cash on delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className={btn('primary')}>
              <ShoppingBag size={18} aria-hidden="true" />
              Shop now
            </Link>
            <Link to="/shop?sort=newest" className={btn('secondary')}>
              New arrivals
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-4" aria-label="Shop by category">
          {storeConfig.categories.map((category, index) => {
            const { icon: Icon, tint } = tiles[category.id];
            return (
              <li key={category.id} className={index === 0 ? 'col-span-2' : ''}>
                <Link
                  to={`/shop?category=${category.id}`}
                  className={`group flex h-full min-h-36 flex-col justify-between rounded-2xl p-5 transition-transform hover:-translate-y-0.5 ${tint}`}
                >
                  <Icon size={32} aria-hidden="true" />
                  <div>
                    <p className="font-display text-lg font-semibold">{category.label}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm opacity-90">
                      {category.description}
                      <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8" aria-labelledby="new-title">
        <div className="flex items-end justify-between gap-4">
          <h2 id="new-title" className="font-display text-2xl font-semibold text-bark-900 sm:text-3xl">
            New arrivals
          </h2>
          <Link to="/shop" className="text-sm font-semibold text-leaf-700 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-8">
          {loading && <Loading />}
          {error && <ErrorNotice message={error} onRetry={reload} />}
          {data && data.items.length === 0 && (
            <EmptyState title="No products yet">Products added by the store will appear here.</EmptyState>
          )}
          {data && data.items.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {data.items.map((product) => (
                <li key={product._id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-20 sm:px-8" aria-labelledby="how-title">
        <h2 id="how-title" className="font-display text-2xl font-semibold text-bark-900 sm:text-3xl">
          How ordering works
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-cream-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-100 font-semibold text-leaf-800">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-bark-700">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
