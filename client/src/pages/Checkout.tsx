import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { ErrorNotice } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../lib/api';
import { errorMessage, formatPrice } from '../lib/format';
import { btn, inputClass } from '../lib/styles';
import type { Order, ShippingAddress, StoreSettings } from '../types';

type Errors = Partial<Record<keyof ShippingAddress, string>>;

function validate(values: ShippingAddress): Errors {
  const errors: Errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (values.phone.trim().length < 7) errors.phone = 'Enter a valid phone number.';
  if (values.address.trim().length < 5) errors.address = 'Enter your full delivery address.';
  if (values.city.trim().length < 2) errors.city = 'Enter your city.';
  return errors;
}

export default function Checkout() {
  usePageTitle('Checkout');
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useFetch<StoreSettings>('/config');
  const navigate = useNavigate();

  const [values, setValues] = useState<ShippingAddress>({ fullName: user?.name ?? '', phone: '', address: '', city: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = settings ? (subtotal >= settings.freeShippingOver ? 0 : settings.shippingFee) : null;

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as keyof ShippingAddress;
    const value = event.target.value;
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof ShippingAddress)[])[0];
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }

    setBusy(true);
    setSubmitError('');
    try {
      await api.post<Order>('/orders', {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: {
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
        },
        paymentMethod: 'cod',
      });
      clear();
      navigate('/orders', { state: { placed: true } });
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const described = (field: keyof ShippingAddress) => (errors[field] ? `checkout-${field}-error` : undefined);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-cream-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Delivery details</h2>

          <Field id="checkout-fullName" label="Full name" error={errors.fullName}>
            <input
              id="checkout-fullName"
              name="fullName"
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={described('fullName')}
              className={inputClass}
            />
          </Field>
          <Field id="checkout-phone" label="Phone number" error={errors.phone}>
            <input
              id="checkout-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={described('phone')}
              className={inputClass}
            />
          </Field>
          <Field id="checkout-address" label="Full address" error={errors.address}>
            <textarea
              id="checkout-address"
              name="address"
              rows={3}
              autoComplete="street-address"
              value={values.address}
              onChange={handleChange}
              aria-invalid={errors.address ? true : undefined}
              aria-describedby={described('address')}
              className={inputClass}
            />
          </Field>
          <Field id="checkout-city" label="City" error={errors.city}>
            <input
              id="checkout-city"
              name="city"
              autoComplete="address-level2"
              value={values.city}
              onChange={handleChange}
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={described('city')}
              className={inputClass}
            />
          </Field>

          <div className="rounded-lg bg-cream-100 p-4 text-sm text-bark-700">
            <p className="font-semibold text-bark-900">Payment: Cash on Delivery</p>
            <p className="mt-1">You pay in cash when your order arrives.</p>
          </div>

          {submitError && <ErrorNotice message={submitError} />}

          <button type="submit" className={`${btn('primary')} w-full sm:w-auto`} disabled={busy}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-cream-200 bg-white p-6" aria-label="Order summary">
          <h2 className="font-display text-xl font-semibold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span className="text-bark-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t border-cream-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-bark-700">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-bark-700">Delivery</dt>
              <dd className="font-medium">{shipping === null ? '…' : shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            {shipping !== null && (
              <div className="flex justify-between border-t border-cream-200 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">{formatPrice(subtotal + shipping)}</dd>
              </div>
            )}
          </dl>
          <Link to="/cart" className="mt-5 inline-block text-sm font-medium text-leaf-700 hover:underline">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
