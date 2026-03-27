'use client';
import Link from 'next/link';
import { Type, CalendarDays, FileText, Layers, Sparkles, ArrowRight, Zap, Download, Tag } from 'lucide-react';

const products = [
  {
    href: '/create/font',
    label: 'Font Product',
    icon: Type,
    desc: 'Generate thumbnails & SEO for custom font listings',
    gradient: 'linear-gradient(135deg, #C084FC 0%, #F472B6 100%)',
    count: '4 thumbnails',
    tags: ['Commercial License', 'OTF/TTF', 'Instant Download'],
  },
  {
    href: '/create/planner',
    label: 'Digital Planner',
    icon: CalendarDays,
    desc: 'Create stunning slides for your digital planner products',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
    count: '4 thumbnails',
    tags: ['GoodNotes', 'iPad Ready', 'Undated'],
  },
  {
    href: '/create/cv',
    label: 'CV Template',
    icon: FileText,
    desc: 'Professional preview slides for your resume templates',
    gradient: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)',
    count: '3 thumbnails',
    tags: ['ATS-Friendly', 'Word/Canva', 'Cover Letter'],
  },
  {
    href: '/create/silhouette',
    label: 'Silhouette SVG',
    icon: Layers,
    desc: 'Showcase your SVG cut file bundles with eye-catching previews',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F87171 100%)',
    count: '3 thumbnails',
    tags: ['SVG/PNG/DXF', 'Cricut', 'Commercial Use'],
  },
];

const features = [
  { icon: Zap, label: 'AI SEO Generator', desc: 'Gemini-powered titles, descriptions & 13 tags' },
  { icon: Download, label: 'PNG Export', desc: 'Download individual or ZIP of all thumbnails' },
  { icon: Tag, label: '2000×2000px', desc: 'Etsy-standard high-resolution output' },
];

export default function CreatePage() {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }} className="animate-fade-in">
        <div className="badge badge-purple" style={{ marginBottom: 16 }}>
          <Sparkles size={11} />
          Etsy Creator Studio
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
          Build{' '}
          <span className="gradient-text">Listing-Ready</span>{' '}
          Products
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 520, lineHeight: 1.6 }}>
          Pick a product type below and generate professional Etsy thumbnails plus AI-powered SEO content in seconds.
        </p>
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 48 }}>
        {products.map((p, i) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.href}
              href={p.href}
              style={{ textDecoration: 'none', animationDelay: `${i * 0.08}s` }}
              className="animate-fade-in"
            >
              <div
                className="card"
                style={{
                  padding: 28,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-3px)';
                  el.style.borderColor = 'var(--border-hover)';
                  el.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = '';
                  el.style.borderColor = '';
                  el.style.boxShadow = '';
                }}
              >
                {/* BG accent */}
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120,
                  background: p.gradient,
                  opacity: 0.07,
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: p.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                    {p.count} <ArrowRight size={12} />
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: 'var(--text-primary)' }}>
                    {p.label}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                    {p.desc}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                  {p.tags.map(t => (
                    <span key={t} style={{
                      padding: '3px 10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Feature highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {features.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="card" style={{ padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(192,132,252,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
