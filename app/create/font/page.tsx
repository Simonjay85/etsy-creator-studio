'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, Download, Sparkles, RefreshCw, Copy, Check, X, Image as ImageIcon } from 'lucide-react';
import {
  drawIntroThumbnail,
  drawCharSheetThumbnail,
  drawQuoteThumbnail,
  drawInfoThumbnail,
} from '@/components/FontCanvas';

type BgStyle = 'pastel-pink' | 'cream' | 'dark' | 'pastel-green' | 'pastel-blue';

interface SeoResult {
  title: string;
  description: string;
  tags: string[];
}

let fontCounter = 0;

export default function FontCreatorPage() {
  const [fontName, setFontName] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [bgStyle, setBgStyle] = useState<BgStyle>('pastel-pink');
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontFamilyName, setFontFamilyName] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const introRef = useRef<HTMLCanvasElement>(null);
  const charRef = useRef<HTMLCanvasElement>(null);
  const quoteRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thumbRefs = [
    { ref: introRef, label: 'Intro Slide', key: 'intro' },
    { ref: charRef, label: 'Character Sheet', key: 'charsheet' },
    { ref: quoteRef, label: 'Quote Mockup', key: 'quote' },
    { ref: infoRef, label: "Whats Included", key: 'info' },
  ];

  const regenerateThumbnails = useCallback(() => {
    if (!fontFamilyName) return;
    setGenerating(true);
    const opts = { fontName, fontStyle, quoteText, bgStyle, fontFamilyName };
    setTimeout(() => {
      if (introRef.current) drawIntroThumbnail(introRef.current, opts);
      if (charRef.current) drawCharSheetThumbnail(charRef.current, opts);
      if (quoteRef.current) drawQuoteThumbnail(quoteRef.current, opts);
      if (infoRef.current) drawInfoThumbnail(infoRef.current, opts);
      setGenerating(false);
    }, 50);
  }, [fontFamilyName, fontName, fontStyle, quoteText, bgStyle]);

  useEffect(() => {
    if (fontLoaded) regenerateThumbnails();
  }, [fontLoaded, fontName, fontStyle, quoteText, bgStyle, regenerateThumbnails]);

  const loadFont = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const name = `CustomFont_${++fontCounter}`;
    try {
      const face = new FontFace(name, buffer);
      await face.load();
      document.fonts.add(face);
      setFontFamilyName(name);
      setFontLoaded(true);
      setFileName(file.name);
      if (!fontName) setFontName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      showToast(`Font loaded: ${file.name}`);
    } catch (e) { showToast('Failed to load font file'); console.error(e); }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(ttf|otf|woff|woff2)$/i.test(file.name)) loadFont(file);
    else showToast('Please upload a TTF, OTF, WOFF, or WOFF2 file');
  };

  const downloadSingle = (ref: React.RefObject<HTMLCanvasElement | null>, label: string) => {
    const canvas = ref.current; if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${fontName || 'font'}-${label}.png`; a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const { ref, label } of thumbRefs) {
      const canvas = ref.current; if (!canvas) continue;
      const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
      zip.file(`${fontName || 'font'}-${label}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url;
    a.download = `${fontName || 'font'}-etsy-thumbnails.zip`; a.click();
    URL.revokeObjectURL(url);
    showToast('All thumbnails downloaded!');
  };

  const generateSeo = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Please set your Gemini API key in Settings'); return; }
    setSeoLoading(true);
    try {
      const res = await fetch('/api/generate-seo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType: 'font', name: fontName, style: fontStyle, description: '', apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSeo(data); showToast('SEO content generated!');
    } catch (e) { showToast(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setSeoLoading(false); }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const bgOptions: { value: BgStyle; label: string; preview: string }[] = [
    { value: 'pastel-pink', label: 'Pastel Pink', preview: '#FDE8EE' },
    { value: 'cream', label: 'Cream', preview: '#FFF8EE' },
    { value: 'dark', label: 'Dark', preview: '#1A1225' },
    { value: 'pastel-green', label: 'Pastel Green', preview: '#E8F8F0' },
    { value: 'pastel-blue', label: 'Pastel Blue', preview: '#E8EEF8' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT: Settings */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>🔤 Font Tool</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Upload font, customize & generate</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Upload */}
          <div>
            <label className="label">Font File</label>
            <div className={`dropzone ${dragging ? 'dragging' : ''}`} style={{ padding: fontLoaded ? 14 : 28 }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" onChange={e => { const f = e.target.files?.[0]; if (f) loadFont(f); }} style={{ display: 'none' }} />
              {fontLoaded ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🔤</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
                    <div style={{ fontSize: 11, color: 'var(--success)' }}>✓ Font loaded</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFontLoaded(false); setFontFamilyName(''); setFileName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload size={24} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Drop font file or click</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>.TTF · .OTF · .WOFF</div>
                </div>
              )}
            </div>
          </div>

          <div><label className="label">Font Name</label><input className="input" placeholder="e.g. Stay Chunky" value={fontName} onChange={e => setFontName(e.target.value)} /></div>
          <div><label className="label">Style / Vibe</label><input className="input" placeholder="e.g. Retro Groovy, Bold Script..." value={fontStyle} onChange={e => setFontStyle(e.target.value)} /></div>
          <div>
            <label className="label">Quote Text (Slide 3)</label>
            <textarea className="input" placeholder="YOU ARE MADE OF MAGIC" value={quoteText} onChange={e => setQuoteText(e.target.value)} rows={2} style={{ resize: 'vertical' }} />
          </div>

          {/* BG Swatches */}
          <div>
            <label className="label">Background Style</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {bgOptions.map(opt => (
                <button key={opt.value} onClick={() => setBgStyle(opt.value)} title={opt.label} style={{ width: 32, height: 32, borderRadius: '50%', background: opt.preview, border: bgStyle === opt.value ? '3px solid var(--accent)' : '2px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: bgStyle === opt.value ? '0 0 0 2px rgba(192,132,252,0.4)' : 'none' }} />
              ))}
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={regenerateThumbnails} disabled={!fontLoaded}>
            <RefreshCw size={14} />Regenerate
          </button>
          <div className="divider" style={{ margin: 0 }} />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={downloadAll} disabled={!fontLoaded}>
            <Download size={14} />Download All (ZIP)
          </button>
        </div>
      </div>

      {/* CENTER: Canvas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Thumbnails</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>2000 × 2000px · Etsy standard</p>
          </div>
          {generating && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 13 }}><div className="spinner" style={{ width: 16, height: 16 }} />Rendering…</div>}
        </div>

        {fontLoaded ? (
          <div className="thumbnail-grid">
            {thumbRefs.map(({ ref, label, key }) => (
              <div key={key} className="thumbnail-item">
                <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
                <div className="thumbnail-overlay">
                  <button className="btn btn-primary btn-sm" onClick={() => downloadSingle(ref, label)}><Download size={12} />Download</button>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '20px 12px 8px', fontSize: 11, color: 'white', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12, border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', minHeight: 400 }}>
            <ImageIcon size={48} style={{ opacity: 0.3 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No font loaded</div>
              <div style={{ fontSize: 13 }}>Upload a font file to generate thumbnails</div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: SEO */}
      <div style={{ width: 330, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>✨ SEO Generator</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>AI-powered Etsy listing content</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateSeo} disabled={seoLoading || !fontName}>
            {seoLoading ? <><div className="spinner" />Generating…</> : <><Sparkles size={15} />Generate Listing Content</>}
          </button>
          {!fontName && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Enter a font name above to generate SEO</div>}
          {seo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease' }}>
              {/* Title */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: seo.title.length > 120 ? 'var(--warning)' : 'var(--success)' }}>{seo.title.length}/140</span>
                    <button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.title, 'title')}>{copied === 'title' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{seo.title}</p>
              </div>

              {/* Description */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</span>
                  <button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.description, 'desc')}>{copied === 'desc' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', maxHeight: 180, overflowY: 'auto' }}>{seo.description}</div>
              </div>

              {/* Tags */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags ({seo.tags.length}/13)</span>
                  <button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.tags.join(', '), 'tags')}>{copied === 'tags' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {seo.tags.map((tag, i) => (
                    <span key={i} className="seo-tag" onClick={() => copyText(tag, `tag-${i}`)} style={{ cursor: 'pointer' }}>
                      {copied === `tag-${i}` ? <Check size={10} /> : null}{tag}
                    </span>
                  ))}
                </div>
              </div>

              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => copyText(`TITLE:\n${seo.title}\n\nDESCRIPTION:\n${seo.description}\n\nTAGS:\n${seo.tags.join(', ')}`, 'all')}>
                {copied === 'all' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy All</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span style={{ fontSize: 13 }}>{toast}</span>
          <button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginLeft: 8 }}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
