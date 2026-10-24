import { useEffect } from 'react';
import { storeConfig } from '../config/store';

export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${storeConfig.name}` : storeConfig.name;
  }, [title]);
}
