'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CMS_MAP, INITIAL_CMS_DATA, CmsItem } from './cmsData';

export function useCms() {
  const [contentMap, setContentMap] = useState<Record<string, string>>(DEFAULT_CMS_MAP);
  const [items, setItems] = useState<CmsItem[]>(INITIAL_CMS_DATA);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/content');
      if (res.ok) {
        const data = await res.json();
        if (data.contentMap) {
          setContentMap((prev) => ({ ...prev, ...data.contentMap }));
        }
        if (data.items) {
          setItems(data.items);
        }
      }
    } catch (e) {
      console.warn('Could not refresh CMS content:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cms = useCallback(
    (key: string, fallback?: string): string => {
      if (contentMap && contentMap[key] !== undefined && contentMap[key] !== '') {
        return contentMap[key];
      }
      if (DEFAULT_CMS_MAP[key] !== undefined) {
        return DEFAULT_CMS_MAP[key];
      }
      return fallback || '';
    },
    [contentMap]
  );

  return {
    cms,
    contentMap,
    items,
    loading,
    refresh,
  };
}
