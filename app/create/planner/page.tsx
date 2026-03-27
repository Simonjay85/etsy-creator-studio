'use client';
import { useState, useRef, useCallback } from 'react';
import { CalendarDays, Download, Image, ChevronRight } from 'lucide-react';
import JSZip from 'jszip';
import SeoPanel from '@/components/SeoPanel';

const CANVAS_SIZE = 2000;

function drawBg(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 0.12) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

interface SlideSpec { label: string; draw: (ctx: CanvasRenderingContext2D, name: string, style: string, features: string) => void }

function buildSlides(name: string, style: string, features: string): SlideSpec[] {
  return [
    {
      label: 'Cover',
      draw(ctx) {
        drawBg(ctx, '#0A1628', '#1E3A5F');
        circle(ctx, 300, 300, 500, '#60A5FA');
        circle(ctx, CANVAS_SIZE - 200, CANVAS_SIZE - 200, 600, '#818CF8');

        // Badge
        ctx.fillStyle = 'rgba(96,165,250,0.15)';
        ctx.strokeStyle = 'rgba(96,165,250,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(700, 480, 600, 68, 34); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 34px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦  DIGITAL PLANNER  ✦', CANVAS_SIZE / 2, 525);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 180px Inter, sans-serif';
        ctx.fillText(name || 'My Planner', CANVAS_SIZE / 2, 800);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '52px Inter, sans-serif';
        ctx.fillText(style || 'Dated Digital Planner 2026', CANVAS_SIZE / 2, 890);

        // Feature pills
        const feats = ['GoodNotes 5', 'Notability', 'iPad Ready', 'Instant Download'];
        const pillW = 380, pillGap = 30;
        const totalW = feats.length * pillW + (feats.length - 1) * pillGap;
        const startX = (CANVAS_SIZE - totalW) / 2;
        feats.forEach((f, i) => {
          const x = startX + i * (pillW + pillGap);
          ctx.fillStyle = 'rgba(96,165,250,0.12)';
          ctx.strokeStyle = 'rgba(96,165,250,0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, 1020, pillW, 70, 35); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '34px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f, x + pillW / 2, 1063);
        });
      },
    },
    {
      label: 'Pages Preview',
      draw(ctx) {
        drawBg(ctx, '#F0F7FF', '#EBF4FF');
        circle(ctx, 0, 0, 400, '#60A5FA', 0.08);
        circle(ctx, CANVAS_SIZE, CANVAS_SIZE, 500, '#818CF8', 0.08);

        ctx.fillStyle = '#0A1628';
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("WHAT'S INSIDE", CANVAS_SIZE / 2, 170);

        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(750, 195); ctx.lineTo(1250, 195); ctx.stroke();

        const pages = [
          ['📅', 'Daily Planner', '365 pages'],
          ['📆', 'Weekly Spread', '52 weeks'],
          ['📊', 'Monthly View', '12 months'],
          ['🎯', 'Goal Tracker', 'Quarterly'],
          ['📝', 'Notes Pages', 'Lined & Dotted'],
          ['🗂️', 'Tab Dividers', '12 sections'],
        ];
        const cols = 3, gapX = 40, gapY = 40, cardW = 560, cardH = 210;
        const tW = cols * cardW + (cols - 1) * gapX;
        const sX = (CANVAS_SIZE - tW) / 2;
        pages.forEach(([emoji, title, sub], i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const x = sX + col * (cardW + gapX), y = 280 + row * (cardH + gapY);
          ctx.fillStyle = 'rgba(96,165,250,0.06)';
          ctx.strokeStyle = 'rgba(96,165,250,0.18)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 18); ctx.fill(); ctx.stroke();
          ctx.font = '72px serif';
          ctx.textAlign = 'left';
          ctx.fillText(emoji as string, x + 24, y + 84);
          ctx.fillStyle = '#0A1628';
          ctx.font = 'bold 46px Inter, sans-serif';
          ctx.fillText(title as string, x + 110, y + 84);
          ctx.fillStyle = '#60A5FA';
          ctx.font = '36px Inter, sans-serif';
          ctx.fillText(sub as string, x + 110, y + 140);
        });

        ctx.fillStyle = '#818CF8';
        ctx.font = 'bold 50px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name || 'My Planner', CANVAS_SIZE / 2, 1900);
      },
    },
    {
      label: 'Features',
      draw(ctx) {
        drawBg(ctx, '#12082A', '#1B1040');
        circle(ctx, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 800, '#818CF8', 0.05);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WHY YOU\'LL LOVE IT', CANVAS_SIZE / 2, 220);

        const items = (features || 'Hyperlinked tabs, Dark & Light themes, Minimalist design, Compatible with all apps').split(',').slice(0, 6).map(s => s.trim());
        items.forEach((feat, i) => {
          const y = 380 + i * 220;
          // Line
          ctx.strokeStyle = 'rgba(129,140,248,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(1700, y); ctx.stroke();

          ctx.fillStyle = '#818CF8';
          ctx.font = 'bold 50px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`0${i + 1}`, 300, y + 80);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '54px Inter, sans-serif';
          ctx.fillText(feat, 400, y + 80);
        });
      },
    },
    {
      label: 'Year',
      draw(ctx) {
        drawBg(ctx, '#EEF4FF', '#F4EEFF');
        circle(ctx, CANVAS_SIZE / 2, -200, 700, '#818CF8', 0.1);

        ctx.fillStyle = '#12082A';
        ctx.font = 'bold 58px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AVAILABLE FOR', CANVAS_SIZE / 2, 480);

        ['2026', '2027', '2028'].forEach((yr, i) => {
          const x = 500 + i * 500;
          const isMain = i === 0;
          if (isMain) {
            ctx.fillStyle = 'rgba(129,140,248,0.15)';
            ctx.strokeStyle = '#818CF8';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.roundRect(x - 190, 520, 380, 260, 24); ctx.fill(); ctx.stroke();
          }
          ctx.fillStyle = isMain ? '#818CF8' : '#12082A';
          ctx.font = `bold ${isMain ? 200 : 160}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(yr, x, 720);
          if (isMain) {
            ctx.fillStyle = '#818CF8';
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillText('★ CURRENT ★', x, 800);
          }
        });

        ctx.fillStyle = '#12082A';
        ctx.font = 'bold 70px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name || 'My Planner', CANVAS_SIZE / 2, 1100);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.font = '44px Inter, sans-serif';
        ctx.fillText(style || 'Digital Planner | Instant Download', CANVAS_SIZE / 2, 1180);
      },
    },
  ];
}


export default function PlannerPage() {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [features, setFeatures] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const previewRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const slides = buildSlides(name, style, features);

  const renderSlides = useCallback(() => {
    slides.forEach((slide, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
      slide.draw(canvas.getContext('2d')!, name, style, features);
      const preview = previewRefs.current[i];
      if (preview) {
        preview.width = 320; preview.height = 320;
        preview.getContext('2d')!.drawImage(canvas, 0, 0, 320, 320);
      }
    });
  }, [slides, name, style, features]);

  const downloadOne = (idx: number) => {
    const canvas = canvasRefs.current[idx];
    if (!canvas) return;
    canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
    slides[idx].draw(canvas.getContext('2d')!, name, style, features);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${name || 'planner'}-thumbnail-${idx + 1}.png`;
    a.click();
  };

  const downloadAll = async () => {
    setDownloading(true);
    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;
      canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
      slides[i].draw(canvas.getContext('2d')!, name, style, features);
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name || 'planner'}-thumbnail-${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${name || 'planner'}-thumbnails.zip`;
    a.click();
    setDownloading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <span>Create</span><ChevronRight size={13} /><span style={{ color: 'var(--text-secondary)' }}>Digital Planner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #60A5FA, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Digital Planner Creator</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Generate 4 Etsy thumbnails + SEO for your digital planner</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="label" htmlFor="planner-name">Product Name</label>
            <input id="planner-name" className="input" placeholder="e.g. The Ultimate Digital Planner" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="planner-style">Style</label>
            <input id="planner-style" className="input" placeholder="e.g. Minimalist Dark Theme" value={style} onChange={e => setStyle(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="planner-features">Key Features (comma-separated)</label>
          <input id="planner-features" className="input" placeholder="Hyperlinked tabs, Monthly & Weekly views, Undated, GoodNotes 5 compatible" value={features} onChange={e => setFeatures(e.target.value)} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={renderSlides}>
          <Image size={15} /> Generate Thumbnails
        </button>

        <div className="thumbnail-grid">
          {slides.map((slide, i) => (
            <div key={i} className="thumbnail-item">
              <canvas ref={el => { previewRefs.current[i] = el; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={el => { canvasRefs.current[i] = el; }} style={{ display: 'none' }} />
              <div className="thumbnail-overlay">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{slide.label}</div>
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
        <SeoPanel productType="planner" getFormData={() => ({ name, style, features, description: features })} />
      </div>
    </div>
  );
}
