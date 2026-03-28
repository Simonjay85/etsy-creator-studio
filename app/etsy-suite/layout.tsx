import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etsy Digital Product Suite — Font, Planner & CV Thumbnail Generator',
  description: 'Generate professional 2000×2000px Etsy thumbnails and AI-powered SEO content for font products, digital planners, and CV templates.',
};

export default function EtsySuiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
