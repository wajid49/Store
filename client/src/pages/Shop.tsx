import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { EmptyState, ErrorNotice, Loading } from '../components/Status';
import { ProductCard } from '../components/ProductCard';
import { storeConfig } from '../config/store';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { btn, inputClass } from '../lib/styles';
import type { ProductPage } from '../types';

const PAGE_SIZE = 12;

export default function Shop() {
  usePageTitle('Shop');
  const [params, setParams] = useSearchParams();

  const category = params.get('category') ?? '';
  const search = params.get('search') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [term, setTerm] = useState(search);
  useEffect(() => setTerm(search), [search]);

  const query = new URLSearchParams();
  if (category) query.set('category', category);
  if (search) query.set('search', search);
  query.set('sort', sort);
  query.set('page', String(page));
  query.set('limit', String(PAGE_SIZE));

  const { data, error, loading, reload } = useFetch<ProductPage>(`/products?${query.toString()}`);

  /** Changes one filter and goes back to page 1. */
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function goToPage(target: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(target));
    setParams(next);
    window.scrollTo({ top: 0 });
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    update('search', term.trim());
  }

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'border-leaf-700 bg-leaf-700 text-white' : 'border-cream-200 bg-white text-bark-700 hover:border-leaf-700'
    }`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">Shop</h1>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          <button type="button" className={pill(category === '')} aria-pressed={category === ''} onClick={() => update('category', '')}>
            All
          </button>
          {storeConfig.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={pill(category === item.id)}
              aria-pressed={category === item.id}
              onClick={() => update('category', item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="flex gap-2" role="search">
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search products"
              className={`${inputClass} sm:w-56`}
            />
            <button type="submit" className={btn('secondary')} aria-label="Search">
              <Search size={18} aria-hidden="true" />
            </button>
          </form>

          <div>
            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <select id="shop-sort" value={sort} onChange={(event) => update('sort', event.target.value)} className={inputClass}>
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {loading && <Loading />}
        {error && <ErrorNotice message={error} onRetry={reload} />}

        {data && data.items.length === 0 && (
          <EmptyState title="No products found">Try a different search or category.</EmptyState>
        )}

        {data && data.items.length > 0 && (
          <>
            <p className="mb-5 text-sm text-bark-500">
              {data.total} {data.total === 1 ? 'product' : 'products'}
            </p>
            <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((product) => (
                <li key={product._id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            {data.pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pages">
                <button type="button" className={btn('secondary', 'sm')} disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)}>
                  Previous
                </button>
                <span className="text-sm text-bark-700">
                  Page {data.page} of {data.pages}
                </span>
                <button
                  type="button"
                  className={btn('secondary', 'sm')}
                  disabled={data.page >= data.pages}
                  onClick={() => goToPage(data.page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
