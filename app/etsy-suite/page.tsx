'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Type, CalendarDays, FileText, Sparkles, Download, RefreshCw,
  Copy, Check, X, Upload, Key, Eye, EyeOff, ArrowLeft, Zap,
} from 'lucide-react';

import { drawFontIntro, drawFontCharSheet, drawFontQuote, drawFontMockup, drawFontApparel, drawFontBagMockup, drawFontSignage, drawFontWebsite } from '@/lib/canvas/font-templates';
import { drawPlannerCover, drawPlannerInside, drawPlannerFeatures, drawPlannerYears } from '@/lib/canvas/planner-templates';
import { drawCvFront, drawCvSpread, drawCvFeatures } from '@/lib/canvas/cv-templates';

import type {
  ProductType, FontMetadata, PlannerMetadata, CvMetadata, SeoResult,
  BgStyle,
} from '@/lib/etsy/types';
import {
  FONT_DEFAULTS, PLANNER_DEFAULTS, CV_DEFAULTS,
  FONT_THUMBNAILS, PLANNER_THUMBNAILS, CV_THUMBNAILS,
} from '@/lib/etsy/types';

// ─── helpers ────────────────────────────────────────────────────────────────

let fontCounter = 0;

async function generateSeoRequest(productType: ProductType, payload: Record<string, string>, apiKey: string): Promise<SeoResult> {
  const res = await fetch('/api/generate-seo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productType, apiKey, ...payload }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as SeoResult;
}

// ─── main component ──────────────────────────────────────────────────────────

export default function EtsySuitePage() {
  // ── product type ──
  const [productType, setProductType] = useState<ProductType>('font');
  const [activeThumb, setActiveThumb] = useState(0);

  // ── font state ──
  const [font, setFont] = useState<FontMetadata>(FONT_DEFAULTS);
  const [fontDragging, setFontDragging] = useState(false);
  const fontFileRef = useRef<HTMLInputElement>(null);

  // ── planner state ──
  const [planner, setPlanner] = useState<PlannerMetadata>(PLANNER_DEFAULTS);

  // ── cv state ──
  const [cv, setCv] = useState<CvMetadata>(CV_DEFAULTS);

  // ── canvas refs ──
  // Font
  const fontIntroRef   = useRef<HTMLCanvasElement>(null);
  const fontCharRef    = useRef<HTMLCanvasElement>(null);
  const fontQuoteRef   = useRef<HTMLCanvasElement>(null);
  const fontMockRef    = useRef<HTMLCanvasElement>(null);
  const fontApparelRef = useRef<HTMLCanvasElement>(null);
  const fontBagRef     = useRef<HTMLCanvasElement>(null);
  const fontSignageRef = useRef<HTMLCanvasElement>(null);
  const fontWebsiteRef = useRef<HTMLCanvasElement>(null);
  // Planner
  const plannerCoverRef    = useRef<HTMLCanvasElement>(null);
  const plannerInsideRef   = useRef<HTMLCanvasElement>(null);
  const plannerFeaturesRef = useRef<HTMLCanvasElement>(null);
  const plannerYearsRef    = useRef<HTMLCanvasElement>(null);
  // CV
  const cvFrontRef    = useRef<HTMLCanvasElement>(null);
  const cvSpreadRef   = useRef<HTMLCanvasElement>(null);
  const cvFeaturesRef = useRef<HTMLCanvasElement>(null);

  const fontCanvasRefs = [fontIntroRef, fontCharRef, fontQuoteRef, fontMockRef, fontApparelRef, fontBagRef, fontSignageRef, fontWebsiteRef];
  const plannerCanvasRefs = [plannerCoverRef, plannerInsideRef, plannerFeaturesRef, plannerYearsRef];
  const cvCanvasRefs = [cvFrontRef, cvSpreadRef, cvFeaturesRef];

  const allCanvasRefs = productType === 'font' ? fontCanvasRefs
    : productType === 'planner' ? plannerCanvasRefs
    : cvCanvasRefs;
  const allThumbs = productType === 'font' ? FONT_THUMBNAILS
    : productType === 'planner' ? PLANNER_THUMBNAILS
    : CV_THUMBNAILS;

  // ── rendering state ──
  const [rendered, setRendered] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // ── seo state ──
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // ── settings ──
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ── toast ──
  const [toast, setToast] = useState('');
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after hydration
  useEffect(() => { setMounted(true); }, []);

  // ── shared helpers ──
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    const k = localStorage.getItem('gemini_api_key') || '';
    setSavedKey(k); setApiKey(k);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSavedKey(apiKey); setShowSettings(false);
    showToast('API key saved!');
  };

  // ── font loading ──
  const loadFontFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const name = `SuiteFont_${++fontCounter}`;
    try {
      const face = new FontFace(name, buffer);
      await face.load();
      document.fonts.add(face);
      setFont(prev => ({
        ...prev,
        fontFamilyName: name,
        fontLoaded: true,
        fontName: prev.fontName || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      }));
      showToast(`Font loaded: ${file.name}`);
    } catch (e) {
      showToast('Failed to load font file'); console.error(e);
    }
  };

  // ── render thumbnails ──
  const renderThumbnails = useCallback(() => {
    console.log('[renderThumbnails] called, productType:', productType);
    console.log('[refs] fontIntroRef:', fontIntroRef.current, 'plannerCoverRef:', plannerCoverRef.current);
    setGenerating(true);
    setTimeout(() => {
      console.log('[renderThumbnails] timeout fired, productType:', productType);
      if (productType === 'font') {
        console.log('[font] fontIntroRef.current:', fontIntroRef.current);
        if (fontIntroRef.current)   { drawFontIntro(fontIntroRef.current, font); console.log('[font] intro drawn'); }
        if (fontCharRef.current)    drawFontCharSheet(fontCharRef.current, font);
        if (fontQuoteRef.current)   drawFontQuote(fontQuoteRef.current, font);
        if (fontMockRef.current)    drawFontMockup(fontMockRef.current, font);
        if (fontApparelRef.current) drawFontApparel(fontApparelRef.current, font);
        if (fontBagRef.current)     drawFontBagMockup(fontBagRef.current, font);
        if (fontSignageRef.current) drawFontSignage(fontSignageRef.current, font);
        if (fontWebsiteRef.current) drawFontWebsite(fontWebsiteRef.current, font);
      } else if (productType === 'planner') {
        if (plannerCoverRef.current)    drawPlannerCover(plannerCoverRef.current, planner);
        if (plannerInsideRef.current)   drawPlannerInside(plannerInsideRef.current, planner);
        if (plannerFeaturesRef.current) drawPlannerFeatures(plannerFeaturesRef.current, planner);
        if (plannerYearsRef.current)    drawPlannerYears(plannerYearsRef.current, planner);
      } else if (productType === 'cv') {
        if (cvFrontRef.current)    drawCvFront(cvFrontRef.current, cv);
        if (cvSpreadRef.current)   drawCvSpread(cvSpreadRef.current, cv);
        if (cvFeaturesRef.current) drawCvFeatures(cvFeaturesRef.current, cv);
      }
      setRendered(true); setGenerating(false); setRenderCount(c => c + 1);
      console.log('[renderThumbnails] done, rendered=true');
    }, 50);
  }, [productType, font, planner, cv]);

  // Auto-render on first load (after mount), and whenever product type changes
  useEffect(() => {
    if (!mounted) return;
    setRendered(false);
    setActiveThumb(0);
    const timer = setTimeout(() => renderThumbnails(), 150);
    return () => clearTimeout(timer);
  }, [productType, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SEO generation ──
  const generateSeo = async () => {
    if (!savedKey) { setShowSettings(true); showToast('Add your Gemini API key first'); return; }
    setSeoLoading(true);
    try {
      const payload: Record<string, string> = productType === 'font'
        ? { name: font.fontName, style: font.fontStyle, description: font.tagline }
        : productType === 'planner'
        ? { name: planner.name, features: `${planner.pages} pages, ${planner.templates} templates, ${planner.covers} covers`, style: planner.theme }
        : { name: cv.productName, style: `Modern ${cv.formats}`, features: [cv.atsOptimized && 'ATS-friendly', cv.editable && 'Editable', cv.features].filter(Boolean).join(', ') };
      const result = await generateSeoRequest(productType, payload, savedKey);
      setSeo(result); showToast('SEO content generated!');
    } catch (e) {
      showToast(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setSeoLoading(false);
    }
  };

  // ── exports ──
  const downloadCurrentThumb = () => {
    const ref = allCanvasRefs[activeThumb];
    const canvas = ref?.current; if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${allThumbs[activeThumb].filename}.png`; a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    for (let i = 0; i < allCanvasRefs.length; i++) {
      const canvas = allCanvasRefs[i]?.current; if (!canvas) continue;
      const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
      zip.file(`${allThumbs[i].filename}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `etsy-${productType}-thumbnails.zip`; a.click();
    URL.revokeObjectURL(a.href);
    showToast('All thumbnails downloaded!');
  };

  // ── bg style options ──
  const bgOptions: { value: BgStyle; preview: string; label: string }[] = [
    { value: 'pastel-pink',  preview: '#FDE8EE', label: 'Pink' },
    { value: 'cream',        preview: '#FFF8EE', label: 'Cream' },
    { value: 'dark',         preview: '#1A1225', label: 'Dark' },
    { value: 'pastel-green', preview: '#E8F8F0', label: 'Green' },
    { value: 'pastel-blue',  preview: '#E8EEF8', label: 'Blue' },
  ];

  // ── CV accent colors ──
  const cvColors = ['#1B2A4A','#2D4A8A','#8B2635','#1B4A2A','#4A3B1B','#5C3A8A'];

  // ── Planner accent colors ──
  const plannerColors = ['#8B5CF6','#E91E8C','#3F51B5','#00BCD4','#4CAF50','#FF5722'];

  const activeCanvasRef = allCanvasRefs[activeThumb];
  const activeThumbSpec = allThumbs[activeThumb];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ══ LEFT PANEL — Controls ══════════════════════════════════════════ */}
      <div style={{ width: 320, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(192,132,252,0.08) 0%, rgba(244,114,182,0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={15} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Etsy Digital Suite</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Thumbnail + SEO Generator</div>
            </div>
            <a href="/create" style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, textDecoration: 'none' }}>
              <ArrowLeft size={12} /> Tools
            </a>
          </div>

          {/* Product Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
            {([
              { type: 'font' as ProductType, label: 'Font', icon: Type },
              { type: 'planner' as ProductType, label: 'Planner', icon: CalendarDays },
              { type: 'cv' as ProductType, label: 'CV', icon: FileText },
            ]).map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${productType === type ? 'var(--accent)' : 'var(--border)'}`,
                  background: productType === type ? 'rgba(192,132,252,0.12)' : 'var(--bg-card)',
                  color: productType === type ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="scroll-panel" style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ─── FONT FORM ─── */}
          {productType === 'font' && (<>
            {/* Font Uploader */}
            <div>
              <label className="label">Font File</label>
              <div
                className={`dropzone ${fontDragging ? 'dragging' : ''}`}
                style={{ padding: font.fontLoaded ? 12 : 24 }}
                onDragOver={e => { e.preventDefault(); setFontDragging(true); }}
                onDragLeave={() => setFontDragging(false)}
                onDrop={e => { e.preventDefault(); setFontDragging(false); const f = e.dataTransfer.files[0]; if (f && /\.(ttf|otf|woff|woff2)$/i.test(f.name)) loadFontFile(f); else showToast('Please upload TTF, OTF, or WOFF'); }}
                onClick={() => fontFileRef.current?.click()}
              >
                <input ref={fontFileRef} type="file" accept=".ttf,.otf,.woff,.woff2" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) loadFontFile(f); }} />
                {font.fontLoaded ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🔤</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{font.fontFamilyName}</div>
                      <div style={{ fontSize: 11, color: 'var(--success)' }}>✓ Font loaded</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFont(prev => ({ ...prev, fontLoaded: false, fontFamilyName: '' })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Upload size={20} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--text-muted)' }} />
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Drop font or click</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>.TTF · .OTF · .WOFF</div>
                  </div>
                )}
              </div>
            </div>
            <div><label className="label">Font Name</label><input className="input" placeholder="e.g. Mellodia Script" value={font.fontName} onChange={e => setFont(p => ({ ...p, fontName: e.target.value }))} /></div>
            <div><label className="label">Style / Category</label><input className="input" placeholder="e.g. Elegant Script" value={font.fontStyle} onChange={e => setFont(p => ({ ...p, fontStyle: e.target.value }))} /></div>
            <div><label className="label">Tagline</label><input className="input" placeholder="A soft handwritten font for..." value={font.tagline} onChange={e => setFont(p => ({ ...p, tagline: e.target.value }))} /></div>
            <div><label className="label">Preview Phrase (Slide 3)</label>
              <input className="input" placeholder="Create something beautiful" value={font.previewPhrase} onChange={e => setFont(p => ({ ...p, previewPhrase: e.target.value }))} />
            </div>
            <div>
              <label className="label">Background Theme</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {bgOptions.map(opt => (
                  <button key={opt.value} onClick={() => setFont(p => ({ ...p, bgStyle: opt.value }))} title={opt.label} style={{ width: 30, height: 30, borderRadius: '50%', background: opt.preview, border: font.bgStyle === opt.value ? '3px solid var(--accent)' : '2px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: font.bgStyle === opt.value ? '0 0 0 2px rgba(192,132,252,0.4)' : 'none' }} />
                ))}
              </div>
            </div>
          </>)}

          {/* ─── PLANNER FORM ─── */}
          {productType === 'planner' && (<>
            <div><label className="label">Product Name</label><input className="input" placeholder="All-in-One Digital Planner" value={planner.name} onChange={e => setPlanner(p => ({ ...p, name: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label className="label">Pages</label><input className="input" placeholder="120" value={planner.pages} onChange={e => setPlanner(p => ({ ...p, pages: e.target.value }))} /></div>
              <div><label className="label">Templates</label><input className="input" placeholder="35" value={planner.templates} onChange={e => setPlanner(p => ({ ...p, templates: e.target.value }))} /></div>
              <div><label className="label">Covers</label><input className="input" placeholder="12" value={planner.covers} onChange={e => setPlanner(p => ({ ...p, covers: e.target.value }))} /></div>
              <div><label className="label">Theme</label><input className="input" placeholder="Minimal Neutral" value={planner.theme} onChange={e => setPlanner(p => ({ ...p, theme: e.target.value }))} /></div>
            </div>
            <div><label className="label">Supported Years</label><input className="input" placeholder="2026, 2027, 2028" value={planner.years} onChange={e => setPlanner(p => ({ ...p, years: e.target.value }))} /></div>
            <div><label className="label">Compatibility</label><input className="input" placeholder="GoodNotes, Notability, PDF Apps" value={planner.compatibility} onChange={e => setPlanner(p => ({ ...p, compatibility: e.target.value }))} /></div>
            <div>
              <label className="label">Accent Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {plannerColors.map(c => <button key={c} onClick={() => setPlanner(p => ({ ...p, primaryColor: c }))} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: planner.primaryColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: planner.primaryColor === c ? `0 0 0 2px ${c}` : 'none' }} />)}
              </div>
            </div>
          </>)}

          {/* ─── CV FORM ─── */}
          {productType === 'cv' && (<>
            <div><label className="label">Product Name</label><input className="input" placeholder="Modern ATS Resume Template" value={cv.productName} onChange={e => setCv(p => ({ ...p, productName: e.target.value }))} /></div>
            <div><label className="label">Sample Name</label><input className="input" placeholder="Sophia Bennett" value={cv.sampleName} onChange={e => setCv(p => ({ ...p, sampleName: e.target.value }))} /></div>
            <div><label className="label">Role Title</label><input className="input" placeholder="Marketing Specialist" value={cv.roleTitle} onChange={e => setCv(p => ({ ...p, roleTitle: e.target.value }))} /></div>
            <div><label className="label">Formats Included</label><input className="input" placeholder="Canva, Word, PDF" value={cv.formats} onChange={e => setCv(p => ({ ...p, formats: e.target.value }))} /></div>
            <div><label className="label">Features</label><input className="input" placeholder="Cover letter, A4 & US Letter..." value={cv.features} onChange={e => setCv(p => ({ ...p, features: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div onClick={() => setCv(p => ({ ...p, atsOptimized: !p.atsOptimized }))} style={{ width: 38, height: 22, borderRadius: 11, background: cv.atsOptimized ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: cv.atsOptimized ? 18 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                ATS-Friendly
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div onClick={() => setCv(p => ({ ...p, editable: !p.editable }))} style={{ width: 38, height: 22, borderRadius: 11, background: cv.editable ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: cv.editable ? 18 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                Editable
              </label>
            </div>
            <div>
              <label className="label">Accent Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {cvColors.map(c => <button key={c} onClick={() => setCv(p => ({ ...p, accentColor: c }))} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: cv.accentColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: cv.accentColor === c ? `0 0 0 2px ${c}` : 'none' }} />)}
              </div>
            </div>
          </>)}

        </div>

        {/* Action buttons — fixed at bottom of left panel */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary" style={{ width: '100%', fontSize: 13 }} onClick={renderThumbnails}>
            {generating ? <><div className="spinner" style={{ width: 14, height: 14 }} />Rendering…</> : <><RefreshCw size={14} />Generate Thumbnails</>}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={downloadCurrentThumb} disabled={!rendered}>
              <Download size={13} />PNG
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={downloadAllZip} disabled={!rendered}>
              <Download size={13} />ZIP All
            </button>
          </div>
        </div>
      </div>

      {/* ══ CENTER PANEL — Preview ═════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>

        {/* Center header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Preview</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>2000 × 2000px · Etsy standard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {generating && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 12 }}><div className="spinner" style={{ width: 14, height: 14 }} />Rendering…</div>}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activeThumb + 1} / {allThumbs.length} — {activeThumbSpec.label}
            </span>
          </div>
        </div>

        {/* Main canvas preview — all canvases always mounted, toggled by display */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

          {/* Empty/generating overlay */}
          {!rendered && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              color: 'var(--text-muted)', textAlign: 'center', zIndex: 2,
              background: 'var(--bg-base)',
            }}>
              {generating ? (
                <><div className="spinner" style={{ width: 36, height: 36 }} /><div style={{ fontSize: 14 }}>Rendering thumbnails…</div></>
              ) : (
                <>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)' }}>
                    <Zap size={32} style={{ opacity: 0.3 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Click Generate Thumbnails</div>
                    <div style={{ fontSize: 13 }}>Your 2000×2000px previews will appear here</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preview frame — always rendered, hidden until we have content */}
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: rendered ? 1 : 0, transition: 'opacity 0.3s ease',
          }}>
            {/* Font canvases */}
            {fontCanvasRefs.map((ref, i) => (
              <canvas key={`font-${i}`} ref={ref} style={{
                maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                display: productType === 'font' && activeThumb === i ? 'block' : 'none',
                objectFit: 'contain',
              }} />
            ))}
            {/* Planner canvases */}
            {plannerCanvasRefs.map((ref, i) => (
              <canvas key={`planner-${i}`} ref={ref} style={{
                maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                display: productType === 'planner' && activeThumb === i ? 'block' : 'none',
                objectFit: 'contain',
              }} />
            ))}
            {/* CV canvases */}
            {cvCanvasRefs.map((ref, i) => (
              <canvas key={`cv-${i}`} ref={ref} style={{
                maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                display: productType === 'cv' && activeThumb === i ? 'block' : 'none',
                objectFit: 'contain',
              }} />
            ))}
          </div>
        </div>

        {/* Thumbnail tab row */}
        <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, overflowX: 'auto', flexShrink: 0 }}>
          {allThumbs.map((thumb, i) => (
            <button
              key={thumb.key}
              onClick={() => setActiveThumb(i)}
              style={{
                flexShrink: 0, width: 70, height: 70, borderRadius: 'var(--radius-md)',
                border: `2px solid ${activeThumb === i ? 'var(--accent)' : 'var(--border)'}`,
                background: activeThumb === i ? 'rgba(192,132,252,0.1)' : 'var(--bg-card)',
                cursor: 'pointer', overflow: 'hidden', position: 'relative', padding: 0,
                transition: 'all 0.15s',
              }}
              title={thumb.label}
            >
              {rendered && allCanvasRefs[i]?.current ? (
                <img
                  src={allCanvasRefs[i].current!.toDataURL('image/jpeg', 0.4)}
                  alt={thumb.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: 4 }}>
                  {i + 1}
                </div>
              )}
              {activeThumb === i && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL — SEO & Settings ══════════════════════════════════ */}
      <div style={{ width: 350, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* SEO Header */}
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>✨ SEO Generator</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>AI-powered Etsy listing content</div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="API Settings"
              style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', border: `1px solid ${savedKey ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`, background: savedKey ? 'rgba(52,211,153,0.1)' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Key size={15} color={savedKey ? 'var(--success)' : 'var(--text-muted)'} />
            </button>
          </div>

          {/* API Key Settings (inline) */}
          {showSettings && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', animation: 'fadeIn 0.2s ease' }}>
              <label className="label" style={{ marginBottom: 6 }}>Gemini API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ fontSize: 12, paddingRight: 40 }}
                />
                <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: '7px 12px', fontSize: 12 }} onClick={saveApiKey}>Save</button>
                <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setShowSettings(false)}>Cancel</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Get your key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>aistudio.google.com</a>. Stored locally only.
              </div>
            </div>
          )}
        </div>

        {/* SEO content scrollable */}
        <div className="scroll-panel" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

          <button className="btn btn-primary" style={{ width: '100%', fontSize: 13 }} onClick={generateSeo} disabled={seoLoading}>
            {seoLoading
              ? <><div className="spinner" style={{ width: 14, height: 14 }} />Generating…</>
              : <><Sparkles size={14} />Generate Listing Content</>}
          </button>

          {!savedKey && !showSettings && (
            <div style={{ padding: '12px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--warning)', lineHeight: 1.5 }}>
              ⚠️ Add your Gemini API key (click 🔑 above) to enable AI SEO generation.
            </div>
          )}

          {seo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease' }}>
              {/* Title */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: seo.title.length > 120 ? 'var(--warning)' : 'var(--success)' }}>{seo.title.length}/140</span>
                    <button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.title, 'title')}>{copied === 'title' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)' }}>{seo.title}</p>
              </div>

              {/* Description */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</span>
                  <button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.description, 'desc')}>{copied === 'desc' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', maxHeight: 200, overflowY: 'auto' }}>{seo.description}</div>
              </div>

              {/* Tags */}
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags ({seo.tags.length}/13)</span>
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

              {/* Copy all */}
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={() => copyText(`TITLE:\n${seo.title}\n\nDESCRIPTION:\n${seo.description}\n\nTAGS:\n${seo.tags.join(', ')}`, 'all')}>
                {copied === 'all' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy All</>}
              </button>
            </div>
          )}
        </div>

        {/* Back to tools footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          {([
            { href: '/create/font', label: 'Font', icon: Type },
            { href: '/create/planner', label: 'Planner', icon: CalendarDays },
            { href: '/create/cv', label: 'CV', icon: FileText },
          ]).map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 11, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <Icon size={13} />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize: 13 }}>{toast}</span>
          <button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginLeft: 8 }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
