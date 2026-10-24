import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Field } from '../../components/Field';
import { ProductImage } from '../../components/ProductImage';
import { EmptyState, ErrorNotice, Loading } from '../../components/Status';
import { categoryLabel, storeConfig } from '../../config/store';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../lib/api';
import { errorMessage, formatPrice } from '../../lib/format';
import { btn, inputClass } from '../../lib/styles';
import type { Category, Product, ProductPage } from '../../types';

interface FormState {
  name: string;
  description: string;
  price: string;
  category: Category;
  image: string;
  stock: string;
}

const emptyForm: FormState = { name: '', description: '', price: '', category: 'kitchen', image: '', stock: '' };

export function AdminProducts() {
  const { data, error, loading, reload } = useFetch<ProductPage>('/products?limit=100&sort=newest');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      stock: String(product.stock),
    });
    setFormError('');
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function update(key: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((previous) => ({ ...previous, [key]: value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    setNotice('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      stock: Number(form.stock),
    };

    try {
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post('/products', payload);
      setNotice(editingId ? 'Product updated.' : 'Product added.');
      setFormOpen(false);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setNotice('');
    try {
      await api.delete(`/products/${product._id}`);
      setNotice('Product deleted.');
      reload();
    } catch (err) {
      setNotice(errorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Products</h2>
        {!formOpen && (
          <button type="button" className={btn('primary')} onClick={openNew}>
            <Plus size={18} aria-hidden="true" />
            Add product
          </button>
        )}
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-leaf-100 px-4 py-3 text-sm font-medium text-leaf-800">
          {notice}
        </p>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold">{editingId ? 'Edit product' : 'New product'}</h3>

          <Field id="p-name" label="Name">
            <input id="p-name" required value={form.name} onChange={update('name')} className={inputClass} />
          </Field>
          <Field id="p-description" label="Description">
            <textarea id="p-description" rows={3} value={form.description} onChange={update('description')} className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="p-price" label="Price (Rs)">
              <input id="p-price" required type="number" min="0" step="1" value={form.price} onChange={update('price')} className={inputClass} />
            </Field>
            <Field id="p-stock" label="Stock (pieces)">
              <input id="p-stock" required type="number" min="0" step="1" value={form.stock} onChange={update('stock')} className={inputClass} />
            </Field>
            <Field id="p-category" label="Category">
              <select id="p-category" value={form.category} onChange={update('category')} className={inputClass}>
                {storeConfig.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            id="p-image"
            label="Image link (optional)"
            hint="A full link (https://...) or a file in the website's public folder, like /images/pot.jpg. Leave empty to show a placeholder."
          >
            <input id="p-image" value={form.image} onChange={update('image')} placeholder="https://..." className={inputClass} />
          </Field>

          {formError && <ErrorNotice message={formError} />}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className={btn('primary')} disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <button type="button" className={btn('secondary')} onClick={() => setFormOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {loading && <Loading />}
        {error && <ErrorNotice message={error} onRetry={reload} />}
        {data && data.items.length === 0 && <EmptyState title="No products yet">Use “Add product” to add your first one.</EmptyState>}

        {data && data.items.length > 0 && (
          <ul className="divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-200 bg-white">
            {data.items.map((product) => (
              <li key={product._id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <ProductImage image={product.image} name={product.name} category={product.category} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-bark-900">{product.name}</p>
                  <p className="text-sm text-bark-500">
                    {categoryLabel(product.category)} · {formatPrice(product.price)} ·{' '}
                    <span className={product.stock === 0 ? 'font-medium text-clay-600' : ''}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className={btn('secondary', 'sm')} onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}>
                    <Pencil size={16} aria-hidden="true" />
                    Edit
                  </button>
                  <button type="button" className={btn('danger', 'sm')} onClick={() => handleDelete(product)} aria-label={`Delete ${product.name}`}>
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {data && data.total > data.items.length && (
          <p className="mt-3 text-sm text-bark-500">Showing the newest {data.items.length} of {data.total} products.</p>
        )}
      </div>
    </div>
  );
}
