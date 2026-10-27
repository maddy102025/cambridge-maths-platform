import type { Metadata } from 'next';
import './globals.css';
import FaviconHead from '@/components/common/FaviconHead';

export const metadata: Metadata = {
  title: 'Cambridge O & A Levels Mathematics | Ms. Eleanor Vance',
  description: 'Specialized Cambridge O & A Levels Mathematics education. Clear concepts, structured practice, and confident examination results.',
  keywords: ['Cambridge Mathematics', 'O Level Maths 4024', 'Additional Mathematics 4037', 'A Level Pure Mathematics', 'Mechanics', 'Probability and Statistics', 'LMS', 'Ms. Eleanor Vance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ivory-100 text-slate-muted min-h-screen flex flex-col selection:bg-sage-300 selection:text-slate-900">
        <FaviconHead />
        {children}
      </body>
    </html>
  );
}
