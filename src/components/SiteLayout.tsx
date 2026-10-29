import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import type { HandbookAdapter } from '../types';
import { Icon } from './Icon';
import { SourceLink } from './ui';

/** Admin navigation is intentionally absent until the auth owner supplies a real session. */
export function SiteLayout({ handbook }: { handbook: HandbookAdapter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const location = useLocation();
  const previousPath = useRef(location.pathname + location.search);
  useEffect(() => {
    const path = location.pathname + location.search;
    if (previousPath.current !== path) {
      main.current?.focus();
      window.scrollTo({ top: 0 });
      previousPath.current = path;
    }
  }, [location]);
  const closeMenu = () => setMenuOpen(false);
  return <div className="site-shell">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus(); main.current?.scrollIntoView(); }}>Skip to main content</a>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" to="/" onClick={closeMenu}><span className="brand-icon"><Icon name="book" /></span><span>Student Handbook<span className="brand-subtitle">Your guide to school life</span></span></Link>
      <button ref={menuButton} className="mobile-menu-button button button--quiet" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      <nav id="primary-navigation" className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation" onKeyDown={event => { if (event.key === 'Escape') { closeMenu(); menuButton.current?.focus(); } }}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink><NavLink to="/search" onClick={closeMenu}>Search</NavLink><NavLink to="/browse" onClick={closeMenu}>Browse Handbook</NavLink>
      </nav>
      <Link to="/search" className="header-search" aria-label="Search handbook" onClick={closeMenu}><Icon name="search" /><span>Search handbook</span></Link>
    </div></header>
    {handbook.isSample && <div className="preview-notice"><div className="container"><span className="preview-label">UI Preview</span><span>Sample categories and content. Official handbook and search are not connected.</span><Link to="/preview">Component guide<Icon name="arrow" /></Link></div></div>}
    <main id="main-content" tabIndex={-1} ref={main}><Outlet /></main>
    <footer className="site-footer"><div className="container footer-inner"><div><Link to="/" className="footer-brand"><Icon name="book" />Student Handbook</Link><p>The official handbook text is the authoritative source.</p>{handbook.source && <p>{handbook.source.label}{handbook.source.edition && ` · ${handbook.source.edition}`}</p>}</div><div className="footer-links"><Link to="/browse">Browse handbook<Icon name="arrow" /></Link><SourceLink source={handbook.source} />{handbook.isSample && <span>Interface preview · No official policies published</span>}</div></div></footer>
  </div>;
}
