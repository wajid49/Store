import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, ShoppingCart, X } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu after moving to another page
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const links = [
    { to: '/shop', label: 'Shop' },
    ...storeConfig.categories.map((category) => ({ to: `/shop?category=${category.id}`, label: category.label })),
  ];

  const linkClass = 'rounded-md px-3 py-2 text-sm font-medium text-bark-700 transition-colors hover:text-leaf-700';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="font-display text-xl font-bold text-leaf-700">
          {storeConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex">
            {user ? (
              <>
                <Link to="/orders" className={linkClass}>
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={linkClass}>
                    Admin
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className={linkClass}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass}>
                  Log in
                </Link>
                <Link to="/register" className={linkClass}>
                  Register
                </Link>
              </>
            )}
          </div>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cream-200 bg-white text-bark-900 hover:border-leaf-700"
            aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-600 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-cream-200 bg-white lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-cream-200 bg-cream-50 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-md px-3 py-3 font-medium text-bark-700 hover:bg-cream-100">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-cream-200" />
            {user ? (
              <>
                <Link to="/orders" className="rounded-md px-3 py-3 font-medium text-bark-700 hover:bg-cream-100">
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="rounded-md px-3 py-3 font-medium text-bark-700 hover:bg-cream-100">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-3 py-3 text-left font-medium text-bark-700 hover:bg-cream-100"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-md px-3 py-3 font-medium text-bark-700 hover:bg-cream-100">
                  Log in
                </Link>
                <Link to="/register" className="rounded-md px-3 py-3 font-medium text-bark-700 hover:bg-cream-100">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
