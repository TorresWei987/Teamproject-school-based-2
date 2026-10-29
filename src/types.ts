/** UI-only contracts. Adapt the team's existing API models at the integration boundary. */
export interface Category {
  id: string;
  title: string;
  description?: string;
  icon?: 'calendar' | 'cap' | 'people' | 'laptop' | 'shirt' | 'building';
  sectionCount?: number;
  children?: Category[];
}

export interface SourceReference {
  label: string;
  url?: string;
  edition?: string;
}

/** Blocks contain unmodified source text; no raw HTML is accepted by the reader. */
export type ContentBlock =
  | { type: 'heading'; id: string; text: string; level: 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean };

export interface Policy {
  id: string;
  categoryId: string;
  title: string;
  excerpt?: string;
  source?: SourceReference;
  blocks: ContentBlock[];
  relatedIds?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  /** Internal URL produced by the feature/router owner. */
  href: string;
  source?: SourceReference;
}

export interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

export interface HandbookAdapter {
  /** Set false only when verified official content is supplied. */
  isSample: boolean;
  categories: Category[];
  policies: Policy[];
  source?: SourceReference;
  /** Omit until the real keyword/question search service is ready. */
  search?: (query: string, categoryId: string, signal: AbortSignal) => Promise<SearchResponse>;
}
