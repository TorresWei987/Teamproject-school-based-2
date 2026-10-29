export type IconName = 'book' | 'search' | 'arrow' | 'calendar' | 'cap' | 'people' | 'laptop' | 'shirt' | 'building' | 'chevron' | 'close' | 'menu' | 'document' | 'info' | 'check' | 'link' | 'external' | 'filter';

const paths: Record<IconName, React.ReactNode> = {
  book: <><path d="M12 7c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Z"/><path d="M12 7v14"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2"/></>,
  cap: <><path d="m2 8 10-5 10 5-10 5L2 8Zm4 2v7c4 3 8 3 12 0v-7m4-2v8"/></>,
  people: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-2-4"/></>,
  laptop: <><rect x="5" y="4" width="14" height="12" rx="1"/><path d="m5 16-3 4h20l-3-4M9 20h6"/></>,
  shirt: <path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z"/>,
  building: <><path d="m3 9 9-6 9 6H3Zm2 2v7m7-7v7m7-7v7M3 21h18M2 18h20"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  document: <><path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8m-8 4h6"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  link: <><path d="m10 14 4-4m-5 6-2 2a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2-1 2-2a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"/></>,
  external: <><path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/></>,
  filter: <><path d="M4 7h16M7 12h10m-7 5h4"/></>,
};

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
