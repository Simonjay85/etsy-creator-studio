'use client';
import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Tag } from 'lucide-react';

interface SeoPanelProps {
  productType: string;
  getFormData: () => Record<string, string>;
}

interface SeoResult {
  title: string;
  description: string;
  tags: string[];
}

export default function SeoPanel({ productType, getFormData }: SeoPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!apiKey) {
      setError('Please set your Gemini API key in the sidebar settings.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = getFormData();
      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType, ...formData, apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>AI SEO Generator</span>
        </div>
        <button
          className={`btn btn-primary btn-sm ${loading ? '' : ''}`}
          onClick={generate}
          disabled={loading}
          id="seo-generate-btn"
        >
          {loading ? (
            <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating…</>
          ) : (
            <><RefreshCw size={13} /> {result ? 'Regenerate' : 'Generate SEO'}</>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {!result && !loading && (
        <div style={{
          padding: '28px 20px', background: 'var(--bg-surface)',
          border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <Sparkles size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Fill in your product details above, then click{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>Generate SEO</strong> to create<br />
            an Etsy-optimized title, description, and 13 tags.
          </div>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="label" style={{ margin: 0 }}>Title</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: result.title.length > 140 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {result.title.length}/140
                </span>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => copy(result.title, 'title')}
                  title="Copy title"
                >
                  {copied === 'title' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {result.title}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="label" style={{ margin: 0 }}>Description</span>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => copy(result.description, 'desc')}
                title="Copy description"
              >
                {copied === 'desc' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              </button>
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)',
              whiteSpace: 'pre-line', maxHeight: 200, overflowY: 'auto',
            }}>
              {result.description}
            </div>
          </div>

          {/* Tags */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="label" style={{ margin: 0 }}>Tags</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({result.tags.length}/13)</span>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => copy(result.tags.join(', '), 'tags')}
                title="Copy all tags"
              >
                {copied === 'tags' ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.tags.map((tag, i) => (
                <button
                  key={i}
                  className="seo-tag"
                  onClick={() => copy(tag, `tag-${i}`)}
                  title="Copy tag"
                >
                  <Tag size={10} />
                  {copied === `tag-${i}` ? <Check size={10} color="var(--success)" /> : null}
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
