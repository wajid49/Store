/** Shared Tailwind class strings, so buttons and inputs look the same everywhere. */

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const sizes: Record<Size, string> = { md: 'px-5 py-3', sm: 'px-3 py-2' };

const variants: Record<Variant, string> = {
  primary: 'bg-leaf-700 text-white hover:bg-leaf-800',
  secondary: 'border border-cream-200 bg-white text-bark-900 hover:border-leaf-700 hover:text-leaf-700',
  danger: 'border border-clay-600/40 bg-white text-clay-600 hover:bg-clay-100',
};

export function btn(variant: Variant = 'primary', size: Size = 'md'): string {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export const inputClass =
  'w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-bark-900 placeholder:text-bark-500 transition-colors hover:border-bark-500/50 focus:border-leaf-700';
