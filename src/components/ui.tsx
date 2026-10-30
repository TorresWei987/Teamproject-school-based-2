import { useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Category, Policy, SearchResult, SourceReference } from '../types';
import { Icon } from './Icon';

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' }) {
  return <button className={`button button--${variant} ${className}`} {...props} />;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

/** Uses the route query string; no search implementation is hidden inside this form. */
export function GlobalSearchInput({ query = '', large = false }: { query?: string; large?: boolean }) {
  const navigate = useNavigate();
  const id = useId();
  return <form className={`search-form ${large ? 'search-form--large' : ''}`} role="search" onSubmit={event => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('q') ?? '').trim();
    navigate(`/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  }}>
    <label className="sr-only" htmlFor={id}>Search the student handbook</label>
    <Icon name="search" />
    <input key={query} id={id} name="q" type="search" defaultValue={query} placeholder="Search a topic or ask a question…" autoComplete="off" maxLength={500} />
    <Button type="submit">Search<Icon name="arrow" /></Button>
  </form>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function CategoryTile({ category, sample = false }: { category: Category; sample?: boolean }) {
  return <Link className="category-tile" to={`/browse?category=${encodeURIComponent(category.id)}`}>
    <span className={`category-icon category-icon--${category.icon ?? 'building'}`}><Icon name={category.icon ?? 'book'} /></span>
    <div className="category-tile__body"><h3>{category.title}</h3>{category.description && <p>{category.description}</p>}<span className="category-tile__meta">{sample ? 'Sample category' : category.sectionCount !== undefined ? `${category.sectionCount} sections` : 'Explore category'}</span></div>
    <Icon name="arrow" className="category-arrow" />
  </Link>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="breadcrumbs"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 && <Icon name="chevron" />}{item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}

export function CategorySidebar({ categories, activeId }: { categories: Category[]; activeId?: string }) {
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width: 801px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 801px)');
    const update = () => setExpanded(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function entries(items: Category[]): ReactNode {
    return <ul>{items.map(category => <li key={category.id}><Link to={`/browse?category=${encodeURIComponent(category.id)}`} aria-current={activeId === category.id ? 'page' : undefined}><Icon name={category.icon ?? 'book'} />{category.title}{activeId === category.id && <span className="active-dot" />}</Link>{category.children?.length ? entries(category.children) : null}</li>)}</ul>;
  }
  return <aside className="category-sidebar"><details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}><summary><Icon name="book" />Handbook navigation<Icon name="chevron" /></summary><nav aria-label="Handbook categories"><p className="eyebrow">Contents</p><Link className="all-sections" to="/browse" aria-current={!activeId ? 'page' : undefined}>All categories</Link>{entries(categories)}</nav></details></aside>;
}

export function PolicyMetadata({ category, source, sample }: { category?: string; source?: SourceReference; sample?: boolean }) {
  return <div className="metadata">{category && <span>{category}</span>}{sample && <StatusBadge>Sample content</StatusBadge>}{source && <span><Icon name="document" />{source.label}{source.edition ? ` · ${source.edition}` : ''}</span>}</div>;
}

/** Plain-text highlighting prevents injection from either query text or excerpts. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))].slice(0, 20);
  if (!terms.length) return <>{text}</>;
  const pattern = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return <>{text.split(new RegExp(`(${pattern})`, 'gi')).map((part, index) => terms.some(term => term.toLocaleLowerCase() === part.toLocaleLowerCase()) ? <mark key={index}>{part}</mark> : part)}</>;
}

export function SearchResultItem({ result, query = '' }: { result: SearchResult; query?: string }) {
  return <article className="search-result"><PolicyMetadata category={result.category} source={result.source} /><h2><Link to={result.href}><Highlight text={result.title} query={query} /><Icon name="arrow" /></Link></h2><p><Highlight text={result.excerpt} query={query} /></p></article>;
}

export function EmptyState({ title, children, icon = 'search', action }: { title: string; children: ReactNode; icon?: 'search' | 'book' | 'document'; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state__icon"><Icon name={icon} /></span><h2>{title}</h2><div className="empty-state__copy">{children}</div>{action && <div className="empty-state__action">{action}</div>}</div>;
}

export function ErrorState({ title = 'We couldn’t load the results', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return <div className="error-state" role="alert"><Icon name="info" /><div><h2>{title}</h2><p>{message}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div></div>;
}

export function LoadingSkeleton() {
  return <div role="status" className="loading-state"><span className="sr-only">Loading handbook results…</span>{[0, 1, 2].map(item => <div className="skeleton-result" aria-hidden="true" key={item}><div className="skeleton skeleton--short" /><div className="skeleton skeleton--title" /><div className="skeleton" /><div className="skeleton skeleton--medium" /></div>)}</div>;
}

export function PolicyContentRenderer({ blocks }: { blocks: Policy['blocks'] }) {
  return <div className="policy-content">{blocks.map((block, index) => {
    if (block.type === 'heading') return block.level === 2 ? <h2 key={index} id={block.id}>{block.text}</h2> : <h3 key={index} id={block.id}>{block.text}</h3>;
    if (block.type === 'paragraph') return <p key={index}>{block.text}</p>;
    const List = block.ordered ? 'ol' : 'ul';
    return <List key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</List>;
  })}</div>;
}

export function CopyLinkButton() {
  const [message, setMessage] = useState('');
  return <div className="copy-action"><Button variant="secondary" onClick={async () => {
    try { await navigator.clipboard.writeText(window.location.href); setMessage('Link copied'); }
    catch { setMessage('Copy the page address from your browser to share this section.'); }
  }}><Icon name="link" />Copy link</Button><span role="status">{message}</span></div>;
}

export function SourceLink({ source }: { source?: SourceReference }) {
  if (!source?.url || !/^https?:\/\//i.test(source.url)) return null;
  return <a className="text-link" href={source.url} target="_blank" rel="noreferrer">View original source<Icon name="external" /><span className="sr-only"> (opens in a new tab)</span></a>;
}
