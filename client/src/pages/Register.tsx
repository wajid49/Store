import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { ErrorNotice } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { errorMessage } from '../lib/format';
import { btn, inputClass } from '../lib/styles';

export default function Register() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setBusy(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900">Create an account</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 sm:p-8">
        <Field id="register-name" label="Name">
          <input
            id="register-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="register-email" label="Email">
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="register-password" label="Password" hint="At least 8 characters.">
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <ErrorNotice message={error} />}
        <button type="submit" className={`${btn('primary')} w-full`} disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-bark-700">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="font-semibold text-leaf-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
