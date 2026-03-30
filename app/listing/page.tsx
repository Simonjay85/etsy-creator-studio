'use client';
import { useState, useRef, useCallback } from 'react';
import {
  Sparkles, Copy, Check, X, RefreshCw, ChevronDown, ChevronUp,
  Tag, FileText, Type, AlignLeft, Hash, Zap, Download,
} from 'lucide-react';

type ProductType = 'font' | 'planner' | 'cv' | 'silhouette' | 'custom';
interface ListingResult { title: string; description: string; tags: string[]; }

const PRODUCT_TYPES: { value: ProductType; label: string; icon: string; placeholder: string; color: string }[] = [
  { value: 'font',       label: 'Font',            icon: '🔤', placeholder: 'e.g. Romantic Calligraphy Font',      color: '#7C3AED' },
  { value: 'cv',         label: 'CV Template',     icon: '📄', placeholder: 'e.g. Modern Minimalist Resume',       color: '#2563EB' },
  { value: 'planner',    label: 'Digital Planner', icon: '📅', placeholder: 'e.g. 2025 Aesthetic Daily Planner',   color: '#059669' },
  { value: 'silhouette', label: 'SVG Bundle',       icon: '✂️', placeholder: 'e.g. Butterfly SVG Cut File Bundle',  color: '#DC2626' },
  { value: 'custom',     label: 'Custom Product',  icon: '📦', placeholder: 'e.g. Wedding Invitation Template',    color: '#D97706' },
];

const TITLE_LIMIT = 140;
const TAG_LIMIT = 20;
const MAX_TAGS = 13;

function CountBadge({ count, limit, warn = 0.85 }: { count: number; limit: number; warn?: number }) {
  const ratio = count / limit;
  const color = ratio > 1 ? 'var(--danger)' : ratio > warn ? 'var(--warning)' : 'var(--success)';
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      {count}/{limit}
    </span>
  );
}

export default function ListingBuilderPage() {
  // Form state
  const [productType, setProductType] = useState<ProductType>('font');
  const [productName, setProductName] = useState('');
  const [style, setStyle] = useState('');
  const [features, setFeatures] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  // Result state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [descExpanded, setDescExpanded] = useState(true);
  const [hasResult, setHasResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'manual'>('generate');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const copyText = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const generate = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('⚠️ Set your Gemini API key in Settings first'); return; }
    if (!productName.trim()) { showToast('Please enter a product name'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType, name: productName, style, features, notes: extraNotes, apiKey }),
      });
      const data: ListingResult & { error?: string } = await res.json();
      if (data.error) throw new Error(data.error);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setTags(data.tags?.slice(0, MAX_TAGS) || []);
      setHasResult(true);
      setDescExpanded(true);
      showToast('✨ Listing generated!');
    } catch (e) {
      showToast(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (raw: string) => {
    const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9\s\-]/g, '').substring(0, TAG_LIMIT);
    if (!cleaned || tags.includes(cleaned) || tags.length >= MAX_TAGS) return;
    setTags(prev => [...prev, cleaned]);
    setTagInput('');
  };

  const removeTag = (i: number) => setTags(prev => prev.filter((_, j) => j !== i));

  const exportTxt = () => {
    const content = `ETSY LISTING — ${productName.toUpperCase() || 'PRODUCT'}
${'='.repeat(60)}

TITLE:
${title}

DESCRIPTION:
${description}

TAGS (${tags.length}/13):
${tags.join(', ')}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${productName || 'listing'}-etsy.txt`;
    a.click();
    showToast('Downloaded!');
  };

  const selectedType = PRODUCT_TYPES.find(p => p.value === productType)!;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* ══ LEFT PANEL: Input ══ */}
      <div style={{ width: 300, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏪</span> Etsy Listing Builder
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            AI-generated title, description &amp; tags
          </p>
        </div>

        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Product Type */}
          <div>
            <label className="label">Product Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {PRODUCT_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setProductType(pt.value)}
                  style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: productType === pt.value ? `2px solid ${pt.color}` : '1px solid var(--border)',
                    background: productType === pt.value ? `${pt.color}18` : 'var(--bg-card)',
                    color: productType === pt.value ? pt.color : 'var(--text-secondary)',
                    fontWeight: productType === pt.value ? 700 : 500,
                    fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                  }}
                >
                  <span>{pt.icon}</span> {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="label">Product Name *</label>
            <input
              className="input"
              placeholder={selectedType.placeholder}
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>

          {/* Style */}
          <div>
            <label className="label">Style / Keywords</label>
            <input
              className="input"
              placeholder="e.g. minimalist, boho, modern, elegant"
              value={style}
              onChange={e => setStyle(e.target.value)}
            />
          </div>

          {/* Features */}
          <div>
            <label className="label">Features / What&apos;s Included</label>
            <textarea
              className="input"
              rows={4}
              placeholder={`e.g.\n- Commercial license\n- Instant download\n- 2 page designs\n- ATS-friendly`}
              value={features}
              onChange={e => setFeatures(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 90 }}
            />
          </div>

          {/* Extra notes */}
          <div>
            <label className="label">Extra Instructions <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              className="input"
              rows={2}
              placeholder="e.g. target audience: wedding planners, tone: friendly"
              value={extraNotes}
              onChange={e => setExtraNotes(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          {/* Generate button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', gap: 8, fontSize: 14, padding: '11px 16px' }}
            onClick={generate}
            disabled={loading}
          >
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16 }} />Generating…</>
              : <><Sparkles size={15} />Generate with AI</>
            }
          </button>

          {hasResult && (
            <>
              <div className="divider" style={{ margin: 0 }} />
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={exportTxt}>
                <Download size={14} /> Export as .txt
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══ CENTER: Results ══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Listing Content</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Edit any field · Click tags to remove · Copy individually or all at once
            </p>
          </div>
          {hasResult && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 14px' }}
              onClick={() => copyText(`TITLE:\n${title}\n\nDESCRIPTION:\n${description}\n\nTAGS:\n${tags.join(', ')}`, 'all')}
            >
              {copied === 'all' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy All</>}
            </button>
          )}
        </div>

        {!hasResult && !loading ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 60 }}>
            <div style={{ fontSize: 56 }}>🏪</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>No listing yet</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>Fill in the product details on the left<br />and click <strong>Generate with AI</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Title · 140 chars', 'Description · 500–700 words', '13 Tags · 20 chars each'].map(hint => (
                <span key={hint} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {hint}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── TITLE ── */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Type size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', flex: 1 }}>Title</span>
                <CountBadge count={title.length} limit={TITLE_LIMIT} />
                <button className="btn btn-ghost btn-icon" onClick={() => copyText(title, 'title')} title="Copy title">
                  {copied === 'title' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
              </div>
              <textarea
                className="input"
                rows={3}
                value={title}
                onChange={e => setTitle(e.target.value.substring(0, TITLE_LIMIT))}
                style={{ resize: 'none', fontWeight: 600, fontSize: 14, lineHeight: 1.6, border: 'none', padding: 0, background: 'transparent', width: '100%', outline: 'none' }}
                placeholder="Your optimized Etsy title will appear here…"
              />
            </div>

            {/* ── DESCRIPTION ── */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: descExpanded ? 10 : 0 }}>
                <AlignLeft size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', flex: 1 }}>Description</span>
                <CountBadge count={description.length} limit={5000} warn={0.9} />
                <button className="btn btn-ghost btn-icon" onClick={() => copyText(description, 'desc')}>
                  {copied === 'desc' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setDescExpanded(v => !v)}>
                  {descExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
              {descExpanded && (
                <textarea
                  className="input"
                  rows={16}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ resize: 'vertical', fontSize: 13, lineHeight: 1.8, border: 'none', padding: 0, background: 'transparent', width: '100%', outline: 'none', minHeight: 240 }}
                  placeholder="Your listing description will appear here…"
                />
              )}
            </div>

            {/* ── TAGS ── */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Hash size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', flex: 1 }}>Tags</span>
                <span style={{ fontSize: 11, color: tags.length >= MAX_TAGS ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {tags.length}/{MAX_TAGS}
                </span>
                <button className="btn btn-ghost btn-icon" onClick={() => copyText(tags.join(', '), 'tags')}>
                  {copied === 'tags' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Tag chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px', borderRadius: 'var(--radius-full)',
                      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                      fontSize: 12, fontWeight: 500, color: 'var(--accent)',
                      cursor: 'default',
                    }}
                    onClick={() => copyText(tag, `tag-${i}`)}
                    title="Click to copy tag"
                  >
                    {tag}
                    <button
                      onClick={e => { e.stopPropagation(); removeTag(i); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.6 }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tags yet — generate or add manually below</span>
                )}
              </div>

              {/* Add tag manually */}
              {tags.length < MAX_TAGS && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={tagInputRef}
                    className="input"
                    placeholder={`Add a tag (max ${TAG_LIMIT} chars)…`}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value.substring(0, TAG_LIMIT))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => addTag(tagInput)}>
                    <Tag size={13} /> Add
                  </button>
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Tip: click a tag to copy it · press Enter to add · max 20 chars per tag
              </div>
            </div>

            {/* ── QUICK PREVIEW ── */}
            {hasResult && (
              <div style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                  📋 Listing Checklist
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { label: 'Title', ok: title.length > 0 && title.length <= TITLE_LIMIT, detail: `${title.length}/${TITLE_LIMIT} chars` },
                    { label: 'Description', ok: description.length > 100, detail: `${description.split(/\s+/).filter(Boolean).length} words` },
                    { label: 'Tags', ok: tags.length === MAX_TAGS, detail: `${tags.length}/13 tags` },
                    { label: 'All tags ≤ 20 chars', ok: tags.every(t => t.length <= TAG_LIMIT), detail: tags.filter(t => t.length > TAG_LIMIT).length === 0 ? 'OK' : 'Some tags too long' },
                  ].map(({ label, ok, detail }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: ok ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 }}>
                        {ok ? '✓' : '✗'}
                      </span>
                      <span style={{ flex: 1, color: ok ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 11, color: ok ? 'var(--success)' : 'var(--warning)' }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ RIGHT PANEL: Tips & Quick actions ══ */}
      <div style={{ width: 260, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>💡 Etsy SEO Tips</h3>
        </div>
        <div className="scroll-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {[
            { icon: '🔤', title: 'Title First', body: 'Put the most searched keywords first in the title. Etsy weighs the beginning more.' },
            { icon: '🏷️', title: 'All 13 Tags', body: 'Always use all 13 tags. Mix broad terms (svg cut file) with niche ones (butterfly svg).' },
            { icon: '📝', title: 'Long Description', body: 'Aim for 500–700 words. Include use cases, what\'s included, compatible tools, and a FAQ.' },
            { icon: '🔄', title: 'Repeat Keywords', body: 'Use keywords from your title naturally in the first 2–3 sentences of the description.' },
            { icon: '⚡', title: 'Instant Download', body: 'Always mention "instant download" — buyers specifically search for it.' },
            { icon: '📐', title: 'Tag Length', body: 'Tags can be short phrases (max 20 chars). Use multi-word tags for specificity.' },
          ].map(tip => (
            <div key={tip.title} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.body}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="divider" style={{ margin: '4px 0' }} />

          {/* Regenerate section */}
          {hasResult && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick Actions</div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: 13 }}
                onClick={generate}
                disabled={loading}
              >
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Regenerate All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize: 13 }}>{toast}</span>
          <button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 8 }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
