import { Link, useSearchParams } from 'react-router-dom';
import type { HandbookAdapter } from '../types';
import { Icon } from '../components/Icon';
import { flattenCategories } from '../data/categories';
import { Breadcrumbs, CategorySidebar, CategoryTile, EmptyState, StatusBadge } from '../components/ui';

export function Browse({ handbook }: { handbook: HandbookAdapter }) {
  const [params] = useSearchParams();
  const categoryId = params.get('category') ?? undefined;
  const category = flattenCategories(handbook.categories).find(item => item.id === categoryId);
  const policies = handbook.policies.filter(item => item.categoryId === categoryId);
  return <div className="container page-content"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Browse Handbook', href: categoryId ? '/browse' : undefined }, ...(categoryId ? [{ label: category?.title ?? 'Category not found' }] : [])]} />
    <div className="browse-layout"><CategorySidebar categories={handbook.categories} activeId={categoryId} /><section className="browse-main"><div className="page-heading"><p className="eyebrow">Explore the handbook</p><h1>{categoryId ? category?.title ?? 'Category not found' : 'A place for every policy.'}</h1><p>{categoryId ? category?.description : 'Find your way through the handbook, one topic at a time.'}</p>{handbook.isSample && <StatusBadge>Sample categories · UI preview</StatusBadge>}</div>
      {!categoryId ? handbook.categories.length ? <div className="category-grid category-grid--browse">{handbook.categories.map(item => <CategoryTile key={item.id} category={item} sample={handbook.isSample} />)}</div> : <EmptyState title="No categories published yet" icon="book"><p>Handbook categories will appear once the content system is connected.</p></EmptyState> : !category ? <EmptyState title="We couldn’t find this category" icon="book"><p>This category may have moved. <Link to="/browse">View all categories</Link> to continue.</p></EmptyState> : policies.length ? <div className="section-list"><h2>In this category</h2>{policies.map(policy => <Link className="policy-row" to={`/policy/${encodeURIComponent(policy.id)}`} key={policy.id}><span className="document-icon"><Icon name="document" /></span><div><h3>{policy.title}</h3>{policy.excerpt && <p>{policy.excerpt}</p>}<span className="small muted">{handbook.isSample ? 'Sample reader layout' : 'Read section'}</span></div><Icon name="arrow" /></Link>)}</div> : <EmptyState title={handbook.isSample ? 'This category is a layout example' : 'No sections published yet'} icon="book"><p>{handbook.isSample ? 'Official content has not been supplied. Explore the sample reader in Attendance to see how full sections will look.' : 'Sections will appear here when they are published.'}</p>{handbook.isSample && <Link to="/policy/reader-example" className="button button--secondary">Open sample reader<Icon name="arrow" /></Link>}</EmptyState>}
    </section></div></div>;
}
