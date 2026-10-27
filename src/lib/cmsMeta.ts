export type CmsCategory = 'PUBLIC' | 'STUDENT' | 'TEACHER' | 'GLOBAL';

export interface CmsCategoryMeta {
  id: CmsCategory;
  slug: string;
  href: string;
  title: string;
  navLabel: string;
  description: string;
  previewHref: string;
}

/** Each category maps to one page in the SuperAdmin portal. */
export const CMS_CATEGORIES: CmsCategoryMeta[] = [
  {
    id: 'PUBLIC',
    slug: 'public',
    href: '/cms/public',
    title: 'Public Website',
    navLabel: 'Public Website',
    description:
      'Headlines, taglines, buttons, syllabus copy, methodology, admissions call-to-action, navigation and footer shown to every visitor.',
    previewHref: '/',
  },
  {
    id: 'STUDENT',
    slug: 'student',
    href: '/cms/student',
    title: 'Student Portal',
    navLabel: 'Student Portal',
    description:
      'Dashboard greeting, motivational quote, examiner tip, performance card titles and action buttons seen by enrolled candidates.',
    previewHref: '/student/home',
  },
  {
    id: 'TEACHER',
    slug: 'teacher',
    href: '/cms/teacher',
    title: 'Teacher Workspace',
    navLabel: 'Teacher Workspace',
    description:
      'Instructor dashboard headings, metric card titles and quick-action buttons used in the faculty workspace.',
    previewHref: '/admin',
  },
  {
    id: 'GLOBAL',
    slug: 'global',
    href: '/cms/global',
    title: 'Global Settings',
    navLabel: 'Global Settings',
    description:
      'Academy identity shared across the platform: instructor name and title, contact details, address and office hours.',
    previewHref: '/#contact',
  },
];

/** "public_hero" -> "Hero", "global_settings" -> "Settings", "student_dashboard" -> "Dashboard". */
export function sectionLabel(section: string): string {
  const parts = section.split('_');
  const rest = parts.length > 1 ? parts.slice(1) : parts;
  return rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
