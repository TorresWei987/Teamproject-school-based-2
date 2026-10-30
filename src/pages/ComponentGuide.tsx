import { useState } from 'react';
import { previewResults } from '../data/preview';
import { Breadcrumbs, Button, EmptyState, ErrorState, LoadingSkeleton, SearchResultItem, StatusBadge } from '../components/ui';
import { DataTable, FormField, ManagementShell, Surface } from '../components/management';

/** Isolated, explicitly non-official fixtures. This is not an admin route. */
export function ComponentGuide() {
  const [state, setState] = useState('results');
  const [message, setMessage] = useState('');
  return <div className="container page-content component-guide"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Component guide' }]} /><div className="page-heading"><p className="eyebrow">For the project team</p><h1>One system. A consistent experience.</h1><p>Interactive presentation examples for integration. All content on this page is sample data.</p></div>
    <Surface title="Search presentation"><label className="field-label" htmlFor="preview-state">Preview a search state</label><select id="preview-state" value={state} onChange={event => setState(event.target.value)}><option value="results">Sample result</option><option value="empty">No results</option><option value="loading">Loading</option><option value="error">Error</option></select>
      {state === 'results' && <><p className="small muted preview-caption">Fixed visual fixture · Not a live search result</p>{previewResults.map(result => <SearchResultItem key={result.id} result={result} query="handbook" />)}</>}
      {state === 'empty' && <EmptyState title="No matching sections"><p>Try another keyword, remove a filter, or browse the handbook.</p></EmptyState>}
      {state === 'loading' && <LoadingSkeleton />}
      {state === 'error' && <ErrorState message="This is a sample error state. In the live interface, retry requests new results from the search service." onRetry={() => setState('results')} />}
    </Surface>
    <ManagementShell headingLevel={2} title="Management components" description="Shared presentation primitives. No administrative access or editing is provided here.">
      <Surface title="Form styling"><form className="preview-form" onSubmit={event => { event.preventDefault(); setMessage('Preview validated. No content has been saved or published.'); }}><FormField label="Section title" name="title" placeholder="Enter a title for this preview" hint="Sample input for testing field styles and keyboard interaction." required maxLength={120} /><div className="button-row"><Button type="submit">Validate preview</Button><Button variant="secondary" type="reset" onClick={() => setMessage('')}>Reset</Button></div><p className="small" role="status">{message}</p></form></Surface>
      <Surface title="Tables and status labels"><DataTable caption="Sample management table · display only" columns={['Section', 'Status', 'Content source']}><tr><th scope="row">Reader layout example</th><td><StatusBadge>Sample</StatusBadge></td><td>UI fixture</td></tr><tr><th scope="row">Official handbook</th><td><StatusBadge tone="warning">Not connected</StatusBadge></td><td>Awaiting integration</td></tr></DataTable><p className="small muted">Use status labels only when a real record supplies the corresponding status.</p></Surface>
    </ManagementShell>
  </div>;
}
