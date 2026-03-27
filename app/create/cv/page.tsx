'use client';
import { useState, useRef, useCallback } from 'react';
import { FileText, Download, Image, ChevronRight } from 'lucide-react';
import JSZip from 'jszip';
import SeoPanel from '@/components/SeoPanel';

const S = 2000;

function bg(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
}

function circ(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 0.12) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = c; ctx.fill(); ctx.restore();
}

function drawCVCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string, style: string) {
  // Card bg
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill();

  // Left accent strip
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#34D399'); grad.addColorStop(1, '#60A5FA');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, 10, h);

  // Name area
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold ${Math.floor(w * 0.08)}px Inter, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(name || 'John Smith', x + 48, y + h * 0.22);

  ctx.fillStyle = '#60A5FA';
  ctx.font = `${Math.floor(w * 0.05)}px Inter, sans-serif`;
  ctx.fillText(style || 'Senior Product Designer', x + 48, y + h * 0.33);

  // Divider
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 48, y + h * 0.4); ctx.lineTo(x + w - 48, y + h * 0.4); ctx.stroke();

  // Fake content lines
  for (let i = 0; i < 5; i++) {
    const lw = (i % 2 === 0 ? 0.7 : 0.5) * (w - 100);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x + 48, y + h * 0.45 + i * h * 0.1, lw, 8);
  }
}

interface SlideSpec { label: string; draw: (ctx: CanvasRenderingContext2D, name: string, style: string, features: string) => void }

function buildSlides(name: string, style: string, features: string): SlideSpec[] {
  return [
    {
      label: 'Cover Preview',
      draw(ctx) {
        bg(ctx, '#0A1F1A', '#0D2818');
        circ(ctx, 300, 300, 500, '#34D399');
        circ(ctx, S - 200, S - 200, 600, '#60A5FA');

        ctx.fillStyle = 'rgba(52,211,153,0.15)';
        ctx.strokeStyle = 'rgba(52,211,153,0.4)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(650, 480, 700, 70, 35); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 34px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦  RESUME TEMPLATE  ✦', S / 2, 527);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 160px Inter, sans-serif';
        ctx.fillText(name || 'The Resume', S / 2, 800);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '52px Inter, sans-serif';
        ctx.fillText(style || 'Modern Minimal Design', S / 2, 890);

        // CV Card mockup
        drawCVCard(ctx, 600, 980, 800, 600, name, style);

        const feats = ['ATS Friendly', 'Word & Google Docs', 'Cover Letter', 'Instant Download'];
        const pillW = 360, pillGap = 24;
        const totalW = feats.length * pillW + (feats.length - 1) * pillGap;
        feats.forEach((f, i) => {
          const x = (S - totalW) / 2 + i * (pillW + pillGap);
          ctx.fillStyle = 'rgba(52,211,153,0.1)'; ctx.strokeStyle = 'rgba(52,211,153,0.3)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, 1660, pillW, 64, 32); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#FFFFFF'; ctx.font = '32px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(f, x + pillW / 2, 1700);
        });
      },
    },
    {
      label: 'Two-Page Spread',
      draw(ctx) {
        bg(ctx, '#F0FDF8', '#EFF6FF');
        circ(ctx, 0, 0, 400, '#34D399', 0.08);
        circ(ctx, S, S, 500, '#60A5FA', 0.08);

        ctx.fillStyle = '#0A1F1A';
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAGES INCLUDED', S / 2, 170);

        ctx.strokeStyle = '#34D399'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(700, 195); ctx.lineTo(1300, 195); ctx.stroke();

        // Two CV cards side by side
        drawCVCard(ctx, 160, 260, 780, 960, name, style);
        drawCVCard(ctx, 1060, 260, 780, 960, 'Cover Letter', style);

        ctx.fillStyle = '#0A1F1A';
        ctx.font = 'bold 44px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Resume / CV', 160 + 390, 1280);
        ctx.fillText('Cover Letter', 1060 + 390, 1280);

        const items = (features || 'ATS-optimized, One-click editing, Custom sections').split(',').slice(0, 4).map(s => s.trim());
        const iW = 380, iGap = 30;
        const totalW2 = items.length * iW + (items.length - 1) * iGap;
        items.forEach((item, i) => {
          const x = (S - totalW2) / 2 + i * (iW + iGap);
          ctx.fillStyle = 'rgba(52,211,153,0.1)'; ctx.strokeStyle = 'rgba(52,211,153,0.2)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, 1380, iW, 100, 16); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#0A1F1A'; ctx.font = '36px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(item, x + iW / 2, 1440);
        });

        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 50px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name || 'Resume Template', S / 2, 1920);
      },
    },
    {
      label: 'Feature Callout',
      draw(ctx) {
        bg(ctx, '#0C1117', '#121B2E');
        circ(ctx, S / 2, S / 2, 800, '#34D399', 0.04);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WHY THIS TEMPLATE?', S / 2, 220);

        const featList = (features || 'ATS-Friendly layout,One-page clean design,Fully editable sections,Word & Google Docs,Cover letter included,Instant PDF download').split(',').slice(0, 6).map(s => s.trim());
        featList.forEach((feat, i) => {
          const y = 380 + i * 220;
          ctx.strokeStyle = 'rgba(52,211,153,0.15)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(200, y); ctx.lineTo(1800, y); ctx.stroke();

          // Number
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 54px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`0${i + 1}`, 200, y + 90);

          // Checkmark
          ctx.fillStyle = 'rgba(52,211,153,0.2)';
          ctx.beginPath(); ctx.arc(320, y + 60, 32, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#34D399';
          ctx.font = '36px Inter, sans-serif';
          ctx.fillText('✓', 308, y + 72);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '56px Inter, sans-serif';
          ctx.fillText(feat, 380, y + 88);
        });
      },
    },
  ];
}

export default function CvPage() {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [features, setFeatures] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const previewRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const slides = buildSlides(name, style, features);

  const renderSlides = useCallback(() => {
    slides.forEach((slide, i) => {
      const c = canvasRefs.current[i]; if (!c) return;
      c.width = S; c.height = S;
      slide.draw(c.getContext('2d')!, name, style, features);
      const p = previewRefs.current[i]; if (!p) return;
      p.width = 320; p.height = 320;
      p.getContext('2d')!.drawImage(c, 0, 0, 320, 320);
    });
  }, [slides, name, style, features]);

  const downloadOne = (idx: number) => {
    const c = canvasRefs.current[idx]; if (!c) return;
    c.width = S; c.height = S;
    slides[idx].draw(c.getContext('2d')!, name, style, features);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `${name || 'cv'}-thumbnail-${idx + 1}.png`;
    a.click();
  };

  const downloadAll = async () => {
    setDownloading(true);
    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const c = canvasRefs.current[i]; if (!c) continue;
      c.width = S; c.height = S;
      slides[i].draw(c.getContext('2d')!, name, style, features);
      const blob = await new Promise<Blob>(res => c.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name || 'cv'}-thumbnail-${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${name || 'cv'}-thumbnails.zip`;
    a.click();
    setDownloading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <span>Create</span><ChevronRight size={13} /><span style={{ color: 'var(--text-secondary)' }}>CV Template</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #34D399, #60A5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>CV Template Creator</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Generate 3 Etsy thumbnails + SEO for your resume template</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label" htmlFor="cv-name">Template Name</label>
            <input id="cv-name" className="input" placeholder="e.g. The Executive Resume" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cv-style">Style / Design</label>
            <input id="cv-style" className="input" placeholder="e.g. Modern Minimal" value={style} onChange={e => setStyle(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="cv-features">Features (comma-separated)</label>
          <input id="cv-features" className="input" placeholder="ATS-Friendly, One page, Cover letter, Google Docs, Word, Instant download" value={features} onChange={e => setFeatures(e.target.value)} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={renderSlides}>
          <Image size={15} /> Generate Thumbnails
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {slides.map((slide, i) => (
            <div key={i} className="thumbnail-item" style={{ aspectRatio: '1' }}>
              <canvas ref={el => { previewRefs.current[i] = el; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={el => { canvasRefs.current[i] = el; }} style={{ display: 'none' }} />
              <div className="thumbnail-overlay">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{slide.label}</div>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); downloadOne(i); }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={downloadAll} disabled={downloading}>
          <Download size={15} /> {downloading ? 'Packing ZIP…' : 'Download All as ZIP'}
        </button>
      </div>

      <div style={{ width: 380, flexShrink: 0, borderLeft: '1px solid var(--border)', padding: '32px 24px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
        <SeoPanel productType="cv" getFormData={() => ({ name, style, features, description: features })} />
      </div>
    </div>
  );
}
