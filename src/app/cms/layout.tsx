import type { Metadata } from 'next';
import CmsShell from '@/components/cms/CmsShell';

export const metadata: Metadata = {
  title: 'SuperAdmin Console | Cambridge Maths Academy',
  description: 'Restricted content management console for platform SuperAdmins.',
  robots: { index: false, follow: false },
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
