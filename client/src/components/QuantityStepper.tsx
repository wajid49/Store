import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function QuantityStepper({ value, max, onChange, label }: QuantityStepperProps) {
  const button =
    'flex h-10 w-10 items-center justify-center text-bark-900 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-cream-200 bg-white" role="group" aria-label={label}>
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus size={16} aria-hidden="true" />
      </button>
      <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
