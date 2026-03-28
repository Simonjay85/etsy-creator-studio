// Shared types for the Etsy Digital Product Suite

export type ProductType = 'font' | 'planner' | 'cv';

export type BgStyle = 'pastel-pink' | 'cream' | 'dark' | 'pastel-green' | 'pastel-blue';

export interface FontMetadata {
  fontName: string;
  fontStyle: string;
  tagline: string;
  previewPhrase: string;
  bgStyle: BgStyle;
  fontFamilyName: string;
  fontLoaded: boolean;
}

export interface PlannerMetadata {
  name: string;
  pages: string;
  templates: string;
  covers: string;
  years: string;
  compatibility: string;
  theme: string;
  primaryColor: string;
}

export interface CvMetadata {
  productName: string;
  sampleName: string;
  roleTitle: string;
  formats: string;
  atsOptimized: boolean;
  editable: boolean;
  features: string;
  accentColor: string;
}

export interface SeoResult {
  title: string;
  description: string;
  tags: string[];
}

export interface ThumbnailSpec {
  key: string;
  label: string;
  filename: string;
}

export const FONT_THUMBNAILS: ThumbnailSpec[] = [
  { key: 'intro',    label: 'Intro Slide',       filename: 'font-introducing' },
  { key: 'charsheet',label: 'Character Sheet',   filename: 'font-character-sheet' },
  { key: 'quote',    label: 'Quote Mockup',      filename: 'font-quote-mockup' },
  { key: 'mockup',   label: 'Product Mockup',    filename: 'font-product-mockup' },
  { key: 'apparel',  label: 'Apparel Mockup',    filename: 'font-apparel-mockup' },
  { key: 'bag',      label: 'Bag & Accessories', filename: 'font-bag-mockup' },
  { key: 'signage',  label: 'Signage & Branding',filename: 'font-signage-mockup' },
  { key: 'website',  label: 'Website & Social',  filename: 'font-website-mockup' },
];

export const PLANNER_THUMBNAILS: ThumbnailSpec[] = [
  { key: 'cover', label: 'Cover Slide', filename: 'planner-cover' },
  { key: 'inside', label: 'Inside Page', filename: 'planner-inside-page' },
  { key: 'features', label: 'Feature Highlight', filename: 'planner-features' },
  { key: 'years', label: 'Year Availability', filename: 'planner-years' },
];

export const CV_THUMBNAILS: ThumbnailSpec[] = [
  { key: 'front', label: 'Front Page', filename: 'cv-front-page' },
  { key: 'spread', label: 'Two-Page Spread', filename: 'cv-spread' },
  { key: 'features', label: 'Feature Callout', filename: 'cv-features' },
];

export const FONT_DEFAULTS: FontMetadata = {
  fontName: 'Mellodia Script',
  fontStyle: 'Elegant Script',
  tagline: 'A soft handwritten font for creative branding',
  previewPhrase: 'Create something beautiful',
  bgStyle: 'pastel-pink',
  fontFamilyName: '',
  fontLoaded: false,
};

export const PLANNER_DEFAULTS: PlannerMetadata = {
  name: 'All-in-One Digital Planner',
  pages: '120',
  templates: '35',
  covers: '12',
  years: '2026, 2027, 2028',
  compatibility: 'GoodNotes, Notability, PDF Apps',
  theme: 'Minimal Neutral',
  primaryColor: '#8B5CF6',
};

export const CV_DEFAULTS: CvMetadata = {
  productName: 'Modern ATS Resume Template',
  sampleName: 'Sophia Bennett',
  roleTitle: 'Marketing Specialist',
  formats: 'Canva, Word, PDF',
  atsOptimized: true,
  editable: true,
  features: 'Cover letter included, A4 & US Letter, Instant download',
  accentColor: '#1B2A4A',
};
