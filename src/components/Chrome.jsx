import { useEffect, useState } from 'react';

/* Brand mark: a green "play" arrow inside a browser-tab outline */
export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="1.5" y="3.5" width="25" height="21" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="1.5" y1="9" x2="26.5" y2="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 12.5 L18.5 16.5 L11 20.5 Z" fill="var(--pw)" />
    </svg>
  );
}

/* Light / dark switch. Stores the choice in localStorage and stamps data-theme on <html>. */
export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* private mode etc. — ignore */
    }
  }, [theme]);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button className="btn" id="theme-toggle" type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle light or dark theme">
      {isDark ? (
        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}

/* Reading progress bar under the top bar */
export function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TopBar({ onShare }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#top">
          <BrandMark />
          Inside Playwright
        </a>
        <div className="topbar-actions">
          <button className="btn" id="share-btn" type="button" onClick={onShare}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
            Copy link
          </button>
          <ThemeToggle />
        </div>
      </div>
      <ProgressBar />
    </header>
  );
}

/* Sticky table of contents; highlights the section currently in view */
export function Toc({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!('IntersectionObserver' in window) || els.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -60% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav className="toc" aria-label="On this page">
      <div className="toc-label">On this page</div>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={active === s.id ? 'active' : ''}>
              {s.short}
            </a>
          </li>
        ))}
      </ol>
      <div className="toc-meta">
        ~9 min read
        <br />
        Green = Playwright · Amber = Selenium
      </div>
    </nav>
  );
}

export function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`to-top ${show ? 'show' : ''}`}
      id="to-top"
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
