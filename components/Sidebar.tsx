'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Type, CalendarDays, FileText, Layers, Settings, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/create', label: 'All Products', icon: Sparkles, exact: true },
  { href: '/create/font', label: 'Font', icon: Type },
  { href: '/create/planner', label: 'Digital Planner', icon: CalendarDays },
  { href: '/create/cv', label: 'CV Template', icon: FileText },
  { href: '/create/silhouette', label: 'Silhouette SVG', icon: Layers },
];


export default function Sidebar() {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    const k = localStorage.getItem('gemini_api_key') || '';
    setSavedKey(k);
    setApiKey(k);
  }, []);

  const saveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setSavedKey(apiKey);
    setShowSettings(false);
  };

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="sidebar" style={{ gap: 0 }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Sparkles size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Etsy Creator</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Listing Studio</div>
        </div>
      </div>

      {/* ✨ Etsy Suite featured link */}
      <Link href="/etsy-suite" style={{ textDecoration: 'none', display: 'block', margin: '0 0 12px' }}>
        <div style={{
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient-subtle)',
          border: '1px solid rgba(192,132,252,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={13} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Etsy Suite</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>All-in-one creator</div>
          </div>
          <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--accent)', opacity: 0.6 }} />
        </div>
      </Link>

      {/* Nav section */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '8px 12px 6px', textTransform: 'uppercase' }}>
          Products
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* API Key status */}
      <div style={{ padding: '8px 4px 0' }}>
        {!showSettings ? (
          <button
            onClick={() => setShowSettings(true)}
            className="sidebar-link"
            style={{ width: '100%' }}
          >
            <Settings size={16} />
            <span style={{ flex: 1, fontSize: 13 }}>API Settings</span>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: savedKey ? 'var(--success)' : 'var(--danger)',
              flexShrink: 0,
            }} />
          </button>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            animation: 'fadeIn 0.2s ease',
          }}>
            <div className="label" style={{ marginBottom: 8 }}>Gemini API Key</div>
            <input
              type="password"
              className="input"
              placeholder="AIza..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ marginBottom: 8, fontSize: 12 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '7px 10px', fontSize: 12 }} onClick={saveKey}>
                Save
              </button>
              <button className="btn btn-secondary" style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => setShowSettings(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
