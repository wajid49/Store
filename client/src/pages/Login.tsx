import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { ErrorNotice } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { errorMessage } from '../lib/format';
import { btn, inputClass } from '../lib/styles';

export default function Login() {
  usePageTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-bark-900">Log in</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 sm:p-8">
        <Field id="login-email" label="Email">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="login-password" label="Password">
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <ErrorNotice message={error} />}
        <button type="submit" className={`${btn('primary')} w-full`} disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-bark-700">
        New here?{' '}
        <Link to="/register" state={{ from }} className="font-semibold text-leaf-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
