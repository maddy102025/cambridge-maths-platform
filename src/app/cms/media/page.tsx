import MediaManager from '@/components/cms/MediaManager';

export const metadata = {
  title: 'R2 Media Management | SuperAdmin Console',
  description: 'Manage Cloudflare R2 object storage assets for Cambridge Mathematics platform.',
};

export default function CmsMediaPage() {
  return <MediaManager />;
}
