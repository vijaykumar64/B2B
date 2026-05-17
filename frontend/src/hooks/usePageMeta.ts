import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | ScaleUp Bharat`;
    if (description) {
      const el = document.querySelector('meta[name="description"]');
      el?.setAttribute('content', description);
    }
    return () => {
      document.title = "ScaleUp Bharat — India's Trusted Business Directory";
    };
  }, [title, description]);
}
