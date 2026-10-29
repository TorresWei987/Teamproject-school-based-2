# Student Handbook UI integration

## Starting point and scope

The repository contained only the original README on `main`. All UI work is on the local `ui` branch. The frontend was added in this same repository after the instruction to keep work here. No existing feature, route, schema, backend, or authentication implementation was replaced. No administrative route is exposed.

This is a React 19 + TypeScript + Vite frontend with plain, token-based CSS and React Router. It requires Node 22.12+ and npm. No external fonts, icon library, paid services, or image assets are needed.

## Run locally

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Additional checks:

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

Hash routing works without server rewrites: `/#/`, `/#/search?q=…`, `/#/browse?category=…`, `/#/policy/:id`, and `/#/preview`. If the team adopts a server-aware router, replace the single `HashRouter` in `src/App.tsx` and configure history fallback on the host. Section links use the router's inner hash.

## Connect real content

`src/types.ts` contains presentation contracts, not database schemas. Adapt your own models at the boundary instead of changing shared backend models. `App` accepts a `handbook: HandbookAdapter` prop:

```tsx
import App from './App';
import type { HandbookAdapter } from './types';

const handbook: HandbookAdapter = {
  isSample: false, // only with verified school handbook content
  categories: [], // adapt real categories
  policies: [],   // preserve full original wording and structure
  // source: { label: 'Actual source reference', url: 'actual HTTPS URL', edition: 'actual edition' },
  // search: (query, categoryId, signal) => yourSearchService(query, categoryId, signal),
};

// At the existing React root:
// <App handbook={handbook} />
```

- `Category`: required `id`, `title`; optional `description`, `icon`, actual `sectionCount`, nested `children`. Sidebar supports nested categories, and category/filter/reader lookups traverse them. The overview grid shows top-level categories.
- `Policy`: required `id`, `categoryId`, `title`, `blocks`; optional `excerpt`, `source`, `relatedIds`. Blocks support level 2/3 headings with unique IDs, paragraphs, and ordered/unordered lists. Text is rendered safely, with no raw HTML or rewriting. If the real handbook requires tables, footnotes, or other structures, extend this adapter with the content owner before publishing; do not flatten or truncate official content.
- `SourceReference`: required `label`; optional real `url`, `edition`. Source links accept HTTP(S) URLs and open in a new tab. No school name, edition, dates, or document URL has been invented.
- `SearchResponse`: `results` plus optional actual `total`. Each result needs `id`, `title`, `excerpt`, `category`, router-compatible `href`; `source` is optional. The feature owner supplies section/heading context in `href`.
- Optional `search(query, categoryId, signal)`: returns a promise of `SearchResponse`. Empty `categoryId` means all categories. Requests are aborted on query/filter changes, and stale responses are ignored. The adapter must reject on service failures. There is no local indexing, ranking, AI answering, autocomplete, or invented pagination.
- Data loading for categories/policies and session/auth belongs to the feature owners. `LoadingSkeleton`, `ErrorState`, and `EmptyState` can wrap their async loaders.

## Components

```tsx
import {
  Button, StatusBadge, GlobalSearchInput, SectionHeading, CategoryTile,
  CategorySidebar, Breadcrumbs, PolicyMetadata, SearchResultItem,
  PolicyContentRenderer, EmptyState, LoadingSkeleton, ErrorState,
  CopyLinkButton, SourceLink,
} from './components/ui';
import { ManagementShell, FormField, Surface, DataTable } from './components/management';
```

The path above is relative to `src`; adjust relative imports in feature folders. All link/search/navigation components must be inside the existing router.

| Component | Main props / purpose |
| --- | --- |
| `SiteLayout` | `handbook`; header, mobile menu, skip link, focus handling, footer, route outlet |
| `GlobalSearchInput` | optional `query`, `large`; submits URL query to the search route |
| `SectionHeading` | `title`, optional `description`, `action` |
| `CategoryTile` | `category`, optional `sample`; links to category |
| `CategorySidebar` | `categories`, optional `activeId`; nested navigation and mobile disclosure |
| `Breadcrumbs` | `items: { label, href? }[]`; final item has no href |
| `PolicyMetadata` | optional `category`, `source`, `sample` |
| `SearchResultItem` | `result`, optional `query`; safe plain-text highlighting |
| `PolicyContentRenderer` | `blocks`; exact supplied policy text, semantic markup |
| `EmptyState` | `title`, `children`, optional `icon`, `action` |
| `LoadingSkeleton` | no props; screen-reader status and reduced-motion support |
| `ErrorState` | `message`, optional `title`, `onRetry` |
| `Button` | native button props plus `variant: primary / secondary / quiet` |
| `StatusBadge` | `children`, optional `tone: neutral / success / warning`; text communicates status |
| `FormField` | native input props plus `label`, optional `hint`, `error`; associated descriptions |
| `ManagementShell` | `title`, optional `description`, `actions`, `headingLevel` (1 or 2), `children` |
| `Surface` | optional `title`, `children` |
| `DataTable` | `caption`, `columns: string[]`, `children` as semantic table rows |

`CopyLinkButton` copies the real browser address and reports clipboard failures. `SourceLink` renders only when a real usable URL exists. No unimplemented edit/delete/publish actions are rendered. Mount management components only inside the management owner's protected routes; presentation wrappers do not provide access control. Add an authorized Manage navigation item only after a real session implementation exists.

## Design tokens and styles

- `src/styles/tokens.css`: semantic colors, type sizes, 8px-based spacing scale, corner radii, shadows, transition duration, focus ring, content width.
- `src/styles/app.css`: component classes, responsive layouts, reading typography, reduced-motion and print styles. Base element rules intentionally establish the new app baseline; feature-specific styles use named classes. Avoid importing this baseline into a separate established application without reviewing those base rules.
- System sans-serif is used without a font download. Main text is 16px; metadata is smaller. Reading width is limited to 78 characters. Shell max width is 1200px. Layout changes at 1050, 800, and 600px; small-phone support starts at 320px.
- Shared native `details` disclosures, labeled forms, visible focus, active link indicators, accessible route focus, status messages, and text-based statuses support keyboard and assistive technology use.

## Sample data and unfinished integration

`src/data/preview.ts` is the only fixture file. `previewHandbook` is the default adapter, explicitly labeled across the site as a UI preview. Its six illustrative categories are not verified contents. Only Attendance has a sample reader; other categories explain their placeholder status. Reader copy describes the interface and makes no school policy claims. There is no source metadata.

The real Search route preserves submitted queries and explains that search is unavailable until `search` is supplied. Filters are disabled until that point. `/preview` independently displays one fixed result, no-results, loading, error, and management presentation examples. Its form validates browser input but explicitly saves/publishes nothing. It is a component guide, not an administration system. Production teams should remove the `/preview` route when visual development is complete and supply the verified adapter.

Remaining feature work: official source/content ingestion, keyword and question search, backend category filtering, content fetching, authorization, management CRUD/publishing, and pagination if supported by the actual service. None has been implemented or simulated as a production service.

## Files added and reasons

- Root package/config files, `index.html`, `.gitignore`: minimal frontend toolchain in the existing repo.
- `public/favicon.svg`: original, restrained document mark; no external asset dependency.
- `src/main.tsx`, `src/App.tsx`: application entry and isolated routes.
- `src/types.ts`, `src/data/preview.ts`: documented UI adapter and labeled fixtures.
- `src/components/*`: reusable UI, shell, SVG icons, and management primitives.
- `src/pages/*`: homepage, service-connected search presentation, browse, reader, isolated component guide.
- `src/styles/*`: shared visual system, responsive and accessible presentation.
- `UI_INTEGRATION.md`: teammate handoff; original README is preserved.

## Design references

Reviewed guidance: [USWDS search](https://designsystem.digital.gov/components/search/), [side navigation](https://designsystem.digital.gov/components/side-navigation/), [in-page navigation](https://designsystem.digital.gov/components/in-page-navigation/), [GOV.UK breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/), [NN/g search suggestions](https://www.nngroup.com/articles/site-search-suggestions/), and [WCAG 2.2 additions](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/). Material's [layout](https://m3.material.io/foundations/layout/canonical-examples/overview) and [type](https://m3.material.io/styles/typography/applying-type) pages were requested but served JavaScript-only content; the supplied concrete guidelines were used for those topics.

Applied principles: explicit search labels and submit button, compact scan-friendly results, hierarchical navigation with current-location cues, breadcrumbs, real heading anchors, visible keyboard focus, and no fake suggestions. These guide the design; no external branding or assets were copied. Automated checks do not constitute a full WCAG audit.

## Validation completed

- `npm run typecheck`, `npm run lint`, and `npm run build`: pass. No test suite existed in the original repository.
- npm installation audit: zero reported vulnerabilities at installation.
- Headless Chrome: seven route states at 320, 390, 768, 1280, and 1440px (35 combinations), with no document-level horizontal overflow or runtime errors.
- Axe scans: seven route states at mobile and desktop widths (14 scans), zero violations for the selected WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA tags. An additional adapter-driven category scan also passed.
- Reviewed full-page screenshots at 390 and 1440px. Verified mobile navigation closes after route selection, category disclosures, route focus, skip link activation, copy-link clipboard contents and feedback, reader heading links, query encoding/preservation, preview state switching, and preview form feedback.
- Isolated browser-injected test adapter verified async results, nested-category filtering, clear filter, request cancellation, no-results, service failure/retry, policy navigation, safe literal HTML-like text, regex-character highlighting, and removal of the preview notice for an official-content adapter. Test fixtures were not added to production data or used as real policy content.
- Browser tools and test scripts were installed in `/tmp/handbook-browser` only; they are not application dependencies. Node was temporarily downloaded under `/tmp` because this workstation had no Node/npm on its default PATH. The normal local workflow above requires installing Node or adding an existing installation to PATH.

Manual assistive-technology review and testing against the real search/content/auth integrations remain necessary before production publication.
