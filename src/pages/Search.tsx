import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HandbookAdapter, SearchResponse } from '../types';
import { Icon } from '../components/Icon';
import { flattenCategories } from '../data/categories';
import { EmptyState, ErrorState, GlobalSearchInput, LoadingSkeleton, SearchResultItem } from '../components/ui';

type SearchState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; data: SearchResponse };

/** Thin async service boundary. Search/ranking/filter behavior belongs to the feature owner. */
function ConnectedResults({ search, query, category }: { search: NonNullable<HandbookAdapter['search']>; query: string; category: string }) {
  const [state, setState] = useState<SearchState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    search(query, category, controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ kind: 'ready', data });
    }).catch(() => { if (!controller.signal.aborted) setState({ kind: 'error' }); });
    return () => controller.abort();
  }, [search, query, category, attempt]);
  if (state.kind === 'loading') return <LoadingSkeleton />;
  if (state.kind === 'error') return <ErrorState message="Please try again. If the problem continues, return to Browse Handbook to explore available sections." onRetry={() => { setState({ kind: 'loading' }); setAttempt(attempt + 1); }} />;
  return <div aria-live="polite"><p className="results-summary">{state.data.total !== undefined ? `${state.data.total} ${state.data.total === 1 ? 'result' : 'results'} for “${query}”` : `Results for “${query}”`}</p>{state.data.results.length ? state.data.results.map(result => <SearchResultItem result={result} key={result.id} query={query} />) : <EmptyState title="No matching sections"><p>Try another keyword or a shorter question. You can also remove your category filter or browse the handbook.</p><Link className="button button--secondary" to="/browse">Browse handbook<Icon name="arrow" /></Link></EmptyState>}</div>;
}

export function Search({ handbook }: { handbook: HandbookAdapter }) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const category = params.get('category') ?? '';
  return <div className="container page-content search-page"><div className="page-heading"><p className="eyebrow">Handbook search</p><h1>Let’s find your answer.</h1><p>Search for a topic or ask a question in your own words.</p></div><GlobalSearchInput query={query} />
    <div className="search-layout"><aside className="filter-panel"><details open><summary><Icon name="filter" />Filter results</summary><div className="filter-panel__body"><label htmlFor="category-filter">Category</label><select id="category-filter" value={category} disabled={!handbook.search} onChange={event => {
      const next = new URLSearchParams(params);
      if (event.target.value) next.set('category', event.target.value); else next.delete('category');
      setParams(next);
    }}><option value="">All categories</option>{flattenCategories(handbook.categories).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>{category && handbook.search && <button className="text-button" onClick={() => { const next = new URLSearchParams(params); next.delete('category'); setParams(next); }}>Clear category filter</button>}{!handbook.search && <p className="small muted">Filters become available when search is connected.</p>}</div></details></aside>
      <section className="results-region" aria-label="Search results">{!query ? <EmptyState title="What would you like to know?"><p>Enter a keyword or question above to find the right section of the handbook.</p></EmptyState> : !handbook.search ? <EmptyState title="Search is not connected yet" icon="document"><p>Your query “{query}” is ready. The search team will connect the official handbook here; no results have been generated.</p><Link to="/browse" className="button button--secondary">Browse the layout<Icon name="arrow" /></Link></EmptyState> : <ConnectedResults key={`${query}:${category}`} search={handbook.search} query={query} category={category} />}</section>
    </div>
  </div>;
}
