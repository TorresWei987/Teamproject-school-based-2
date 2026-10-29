import { useEffect } from 'react';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import type { HandbookAdapter } from './types';
import { previewHandbook } from './data/preview';
import { SiteLayout } from './components/SiteLayout';
import { EmptyState } from './components/ui';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Browse } from './pages/Browse';
import { PolicyReader } from './pages/PolicyReader';
import { ComponentGuide } from './pages/ComponentGuide';

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    const page = location.pathname.startsWith('/policy/') ? 'Policy reader' : location.pathname === '/browse' ? 'Browse Handbook' : location.pathname === '/search' ? 'Search' : location.pathname === '/preview' ? 'Component guide' : 'Home';
    document.title = `${page} | Student Handbook`;
    // HashRouter uses the first hash for routing; section anchors use the inner hash.
    if (location.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
  }, [location]);
  return null;
}

/** Replace only the adapter to connect official content; components remain presentation-focused. */
export default function App({ handbook = previewHandbook }: { handbook?: HandbookAdapter }) {
  return <HashRouter><RouteEffects /><Routes><Route element={<SiteLayout handbook={handbook} />}>
    <Route index element={<Home handbook={handbook} />} />
    <Route path="search" element={<Search handbook={handbook} />} />
    <Route path="browse" element={<Browse handbook={handbook} />} />
    <Route path="policy/:id" element={<PolicyReader handbook={handbook} />} />
    <Route path="preview" element={<ComponentGuide />} />
    <Route path="*" element={<div className="container page-content"><EmptyState title="Page not found" icon="book"><p>Let’s get you back to the handbook.</p><Link to="/" className="button button--primary">Go to homepage</Link></EmptyState></div>} />
  </Route></Routes></HashRouter>;
}
