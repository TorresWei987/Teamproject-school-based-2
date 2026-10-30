import { Link } from 'react-router-dom';
import type { HandbookAdapter } from '../types';
import { Icon } from '../components/Icon';
import { CategoryTile, EmptyState, GlobalSearchInput, SectionHeading } from '../components/ui';

export function Home({ handbook }: { handbook: HandbookAdapter }) {
  return <div className="home-page">
    <section className="home-hero container" aria-labelledby="home-title">
      <div className="eyebrow hero-eyebrow"><span />A little clarity for your school day</div>
      <h1 id="home-title">Find what you need in<br className="desktop-break" /> the <span>student handbook.</span></h1>
      <p className="hero-description">Less time looking. More time knowing.<br />Search and browse school policies, all in one place.</p>
      <div className="hero-search"><GlobalSearchInput large /><p className="search-helper">Search policies, procedures, and handbook sections.</p></div>
      <div className="hero-note"><Icon name="document" /><span>Read with the full context.</span></div>
    </section>
    <section className="category-section container" aria-labelledby="category-title">
      <SectionHeading title="Browse by category" description={handbook.isSample ? 'Explore the layout with these illustrative handbook categories.' : 'Know where to look? Start with a topic.'} action={<Link to="/browse" className="text-link">View all categories<Icon name="arrow" /></Link>} />
      {handbook.categories.length ? <div className="category-grid">{handbook.categories.map(category => <CategoryTile key={category.id} category={category} sample={handbook.isSample} />)}</div> : <EmptyState title="Your handbook starts here" icon="book"><p>Categories will appear when the official handbook is connected.</p></EmptyState>}
    </section>
    <section className="container home-help" aria-label="How to use the handbook">
      <div className="help-intro"><span className="help-icon"><Icon name="book" /></span><div><h2>A clearer path to the answers.</h2><p>Start with a search, or take a look around.</p></div></div>
      <div className="help-step"><span>01</span><div><h3>Search in your own words</h3><p>Use a keyword, topic, or question.</p></div></div>
      <div className="help-step"><span>02</span><div><h3>Read the full context</h3><p>Open a section to see the complete text.</p></div></div>
    </section>
  </div>;
}
