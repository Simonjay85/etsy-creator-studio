'use client';
import { useState, useRef, useCallback } from 'react';
import { Layers, Download, Image, ChevronRight } from 'lucide-react';
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

// Simple SVG-style shapes drawn on canvas
function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = size / 20;
  ctx.fillStyle = 'none';
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -size / 2, size / 5, size / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, size / 8, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save(); ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

interface SlideSpec { label: string; draw: (ctx: CanvasRenderingContext2D, name: string, category: string) => void }

function buildSlides(name: string, category: string): SlideSpec[] {
  return [
    {
      label: 'Main Showcase',
      draw(ctx) {
        bg(ctx, '#1A0F00', '#2D1A00');
        circ(ctx, 300, 300, 500, '#FBBF24');
        circ(ctx, S - 200, S - 200, 600, '#F87171');

        ctx.fillStyle = 'rgba(251,191,36,0.15)';
        ctx.strokeStyle = 'rgba(251,191,36,0.4)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(650, 480, 700, 70, 35); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FBBF24'; ctx.font = 'bold 34px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('✦  SVG CUT FILES  ✦', S / 2, 527);

        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 160px Inter, sans-serif';
        ctx.fillText(name || 'Floral Bundle', S / 2, 800);
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '52px Inter, sans-serif';
        ctx.fillText(category || 'Botanical SVG Pack', S / 2, 890);

        // Draw SVG silhouettes
        drawFlower(ctx, 500, 1200, 280, 'rgba(251,191,36,0.6)');
        drawFlower(ctx, 1000, 1150, 340, 'rgba(251,191,36,0.8)');
        drawFlower(ctx, 1500, 1200, 280, 'rgba(251,191,36,0.6)');
        drawStar(ctx, 750, 1350, 40, 'rgba(248,113,113,0.5)');
        drawStar(ctx, 1250, 1350, 40, 'rgba(248,113,113,0.5)');

        const feats = ['SVG', 'PNG', 'DXF', 'EPS', 'Cricut Ready', 'Commercial Use'];
        const pillW = 270, pillGap = 20;
        const totalW = 3 * pillW + 2 * pillGap;
        [feats.slice(0, 3), feats.slice(3)].forEach((row, ri) => {
          const startX = (S - totalW) / 2;
          row.forEach((f, i) => {
            const x = startX + i * (pillW + pillGap);
            const y = 1580 + ri * 90;
            ctx.fillStyle = 'rgba(251,191,36,0.12)'; ctx.strokeStyle = 'rgba(251,191,36,0.3)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(x, y, pillW, 64, 32); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#FFFFFF'; ctx.font = '30px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(f, x + pillW / 2, y + 40);
          });
        });
      },
    },
    {
      label: 'Usage Example',
      draw(ctx) {
        bg(ctx, '#FFFBEB', '#FFF3C4');
        circ(ctx, 0, 0, 400, '#FBBF24', 0.1);
        circ(ctx, S, S, 500, '#F87171', 0.08);

        ctx.fillStyle = '#1A0F00'; ctx.font = 'bold 64px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('USE ON EVERYTHING', S / 2, 170);
        ctx.strokeStyle = '#FBBF24'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(700, 195); ctx.lineTo(1300, 195); ctx.stroke();

        const uses = [
          { emoji: '👕', label: 'T-Shirts & Apparel' },
          { emoji: '☕', label: 'Mugs & Tumblers' },
          { emoji: '📱', label: 'Phone Cases' },
          { emoji: '🎁', label: 'Gift Bags & Wrap' },
          { emoji: '🖼️', label: 'Wall Art & Prints' },
          { emoji: '📓', label: 'Notebooks & Stationery' },
        ];
        const cols = 3, cardW = 540, cardH = 220, gapX = 52, gapY = 40;
        const tW = cols * cardW + (cols - 1) * gapX;
        const sX = (S - tW) / 2;
        uses.forEach(({ emoji, label }, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const x = sX + col * (cardW + gapX), y = 260 + row * (cardH + gapY);
          ctx.fillStyle = 'rgba(251,191,36,0.08)'; ctx.strokeStyle = 'rgba(251,191,36,0.25)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 18); ctx.fill(); ctx.stroke();
          ctx.font = '72px serif'; ctx.textAlign = 'left'; ctx.fillText(emoji, x + 24, y + 82);
          ctx.fillStyle = '#1A0F00'; ctx.font = 'bold 42px Inter, sans-serif'; ctx.fillText(label, x + 110, y + 80);
        });

        drawFlower(ctx, S / 2, 1450, 400, '#FBBF24');
        ctx.fillStyle = '#FBBF24'; ctx.font = 'bold 50px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(name || 'Floral Bundle', S / 2, 1920);
      },
    },
    {
      label: 'Bundle View',
      draw(ctx) {
        bg(ctx, '#0F0700', '#1C0E00');
        circ(ctx, S / 2, S / 2, 800, '#FBBF24', 0.05);

        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 80px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText("WHAT'S INCLUDED", S / 2, 220);

        // Bundle breakdown
        const items = [
          ['20+', 'Silhouette designs'],
          ['5', 'File formats (SVG, PNG, DXF, EPS, PDF)'],
          ['300 DPI', 'High resolution PNG files'],
          ['∞', 'Commercial use license'],
          ['1-click', 'Cricut & Silhouette compatible'],
        ];
        items.forEach(([num, desc], i) => {
          const y = 380 + i * 230;
          ctx.strokeStyle = 'rgba(251,191,36,0.15)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(200, y); ctx.lineTo(1800, y); ctx.stroke();
          ctx.fillStyle = '#FBBF24'; ctx.font = 'bold 90px Inter, sans-serif'; ctx.textAlign = 'left';
          ctx.fillText(num, 200, y + 100);
          ctx.fillStyle = '#FFFFFF'; ctx.font = '54px Inter, sans-serif';
          ctx.fillText(desc, 400, y + 100);
        });
      },
    },
  ];
}

export default function SilhouettePage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const previewRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const slides = buildSlides(name, category);

  const renderSlides = useCallback(() => {
    slides.forEach((slide, i) => {
      const c = canvasRefs.current[i]; if (!c) return;
      c.width = S; c.height = S;
      slide.draw(c.getContext('2d')!, name, category);
      const p = previewRefs.current[i]; if (!p) return;
      p.width = 320; p.height = 320;
      p.getContext('2d')!.drawImage(c, 0, 0, 320, 320);
    });
  }, [slides, name, category]);

  const downloadOne = (idx: number) => {
    const c = canvasRefs.current[idx]; if (!c) return;
    c.width = S; c.height = S;
    slides[idx].draw(c.getContext('2d')!, name, category);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `${name || 'svg'}-thumbnail-${idx + 1}.png`;
    a.click();
  };

  const downloadAll = async () => {
    setDownloading(true);
    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const c = canvasRefs.current[i]; if (!c) continue;
      c.width = S; c.height = S;
      slides[i].draw(c.getContext('2d')!, name, category);
      const blob = await new Promise<Blob>(res => c.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name || 'svg'}-thumbnail-${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${name || 'svg'}-thumbnails.zip`;
    a.click();
    setDownloading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <span>Create</span><ChevronRight size={13} /><span style={{ color: 'var(--text-secondary)' }}>Silhouette SVG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FBBF24, #F87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Silhouette SVG Creator</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Generate 3 Etsy thumbnails + SEO for your SVG cut files</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label className="label" htmlFor="svg-name">Bundle Name</label>
            <input id="svg-name" className="input" placeholder="e.g. Wildflower SVG Bundle" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="svg-category">Category / Theme</label>
            <input id="svg-category" className="input" placeholder="e.g. Botanical Floral Pack" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
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
        <SeoPanel productType="silhouette" getFormData={() => ({ name, style: category, description: `SVG Cut File Bundle - ${category}` })} />
      </div>
    </div>
  );
}
