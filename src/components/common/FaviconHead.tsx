'use client';

import React, { useEffect } from 'react';
import { useCms } from '@/lib/useCms';

export default function FaviconHead() {
  const { cms } = useCms();
  const faviconUrl = cms('global_site_favicon_url', '');

  useEffect(() => {
    if (!faviconUrl) return;

    // Update or create favicon link tag
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;

    // Also update apple-touch-icon if present
    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
    appleLink.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}
