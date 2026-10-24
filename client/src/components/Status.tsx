import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { btn } from '../lib/styles';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-bark-500">
      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-clay-600/30 bg-clay-100 p-5 text-clay-600">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btn('secondary', 'sm')} mt-3`}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-cream-200 bg-white px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold text-bark-900">{title}</p>
      {children && <div className="mt-3 text-bark-500">{children}</div>}
    </div>
  );
}
