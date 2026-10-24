import { useState } from 'react';
import { CookingPot, House, Lamp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '../types';

const placeholders: Record<Category, { icon: LucideIcon; tint: string }> = {
  kitchen: { icon: CookingPot, tint: 'bg-leaf-100 text-leaf-700' },
  home: { icon: House, tint: 'bg-cream-100 text-bark-700' },
  decor: { icon: Lamp, tint: 'bg-clay-100 text-clay-600' },
};

interface ProductImageProps {
  image: string;
  name: string;
  category: Category;
  className?: string;
}

/** Shows the product photo, or a friendly placeholder when there is no photo (or it fails to load). */
export function ProductImage({ image, name, category, className = '' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, tint } = placeholders[category];

  if (!image || failed) {
    return (
      <div className={`flex aspect-square items-center justify-center ${tint} ${className}`} role="img" aria-label={name}>
        <Icon size={48} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`aspect-square w-full object-cover ${className}`}
    />
  );
}
