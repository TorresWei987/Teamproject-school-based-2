import { Link, useLocation, useParams } from 'react-router-dom';
import type { HandbookAdapter } from '../types';
import { Icon } from '../components/Icon';
import { flattenCategories } from '../data/categories';
import { Breadcrumbs, CategorySidebar, CopyLinkButton, EmptyState, PolicyContentRenderer, PolicyMetadata, SourceLink } from '../components/ui';

export function PolicyReader({ handbook }: { handbook: HandbookAdapter }) {
  const { id } = useParams();
  const location = useLocation();
  const policy = handbook.policies.find(item => item.id === id);
  if (!policy) return <div className="container page-content"><EmptyState title="Section not found" icon="document"><p>The section may have moved or may not be available yet.</p><Link to="/browse" className="button button--secondary">Browse handbook</Link></EmptyState></div>;
  const category = flattenCategories(handbook.categories).find(item => item.id === policy.categoryId);
  const headings = policy.blocks.filter(block => block.type === 'heading');
  const related = handbook.policies.filter(item => policy.relatedIds?.includes(item.id));
  return <div className="container page-content"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Handbook', href: '/browse' }, ...(category ? [{ label: category.title, href: `/browse?category=${encodeURIComponent(category.id)}` }] : []), { label: policy.title }]} />
    <div className="reader-layout"><CategorySidebar categories={handbook.categories} activeId={policy.categoryId} /><article className="policy-article"><header className="policy-heading"><PolicyMetadata category={category?.title} source={policy.source} sample={handbook.isSample} /><h1>{policy.title}</h1><div className="reader-actions"><CopyLinkButton /><SourceLink source={policy.source} /></div></header>{handbook.isSample && <div className="sample-callout"><Icon name="info" /><p><strong>Sample reader.</strong> This text demonstrates the interface. It is not official handbook content.</p></div>}<PolicyContentRenderer blocks={policy.blocks} />
      {related.length > 0 && <section className="related-policies"><h2>Related sections</h2>{related.map(item => <Link key={item.id} to={`/policy/${encodeURIComponent(item.id)}`}>{item.title}<Icon name="arrow" /></Link>)}</section>}
      <div className="reader-bottom"><Link to={`/browse?category=${encodeURIComponent(policy.categoryId)}`} className="text-link"><Icon name="arrow" className="rotate-arrow" />Back to {category?.title ?? 'category'}</Link></div>
    </article>{headings.length > 1 && <aside className="on-this-page"><nav aria-label="On this page"><h2>On this page</h2><ul>{headings.map(heading => <li key={heading.id}><Link to={{ pathname: location.pathname, hash: `#${encodeURIComponent(heading.id)}` }}>{heading.text}</Link></li>)}</ul></nav></aside>}</div></div>;
}
