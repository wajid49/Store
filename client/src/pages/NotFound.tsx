import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { btn } from '../lib/styles';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <h1 className="font-display text-4xl font-bold text-bark-900">Page not found</h1>
      <p className="mt-4 text-bark-700">The page you are looking for does not exist.</p>
      <Link to="/" className={`${btn('primary')} mt-8`}>
        Go to the home page
      </Link>
    </div>
  );
}
