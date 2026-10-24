import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-200 bg-cream-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-leaf-700">{storeConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-bark-700">{storeConfig.tagline}.</p>
        </div>

        <nav aria-label="Shop categories">
          <p className="text-sm font-semibold text-bark-900">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {storeConfig.categories.map((category) => (
              <li key={category.id}>
                <Link to={`/shop?category=${category.id}`} className="text-bark-700 hover:text-leaf-700">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <p className="text-sm font-semibold text-bark-900">Your account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/cart" className="text-bark-700 hover:text-leaf-700">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="text-bark-700 hover:text-leaf-700">
                My Orders
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-cream-200 py-5 text-center text-sm text-bark-500">
        © {new Date().getFullYear()} {storeConfig.name}. Payment: Cash on Delivery.
      </div>
    </footer>
  );
}
