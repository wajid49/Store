import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** A label, an input (passed as children) and an optional error message. */
export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-bark-900">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-sm text-bark-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-clay-600">
          {error}
        </p>
      )}
    </div>
  );
}
