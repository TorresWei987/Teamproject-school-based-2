# Handbook — Student question finder

A responsive website for the Oaks Christian High School 2026–27 handbook. Ask a question, browse common topics, and open the cited PDF page.

## Run locally

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. No build, API key, account, or backend is required. Deploy `dist/` to any static host.

## Netlify deployment

Connect this repository's `main` branch to your Netlify team. The root `netlify.toml` publishes the committed `dist/` website and runs `node scripts/check-search.mjs` before deployment. These file settings override the corresponding Netlify dashboard settings.

Do not use `npm run build` for this website: it builds the separate React interface preview in `src/` and replaces `dist/`. Edit and commit the finished site's files in `dist/` for the current deployment workflow. New files inside this ignored folder need `git add -f dist/path/to/file`.

After a successful deployment, check the Lion’s Guide homepage, transparent school crest, a handbook search, and the PDF page links.

## How answers work

The original 92-page PDF is included in `dist/assets/handbook.pdf`. Its extracted page text is in `dist/assets/handbook.json`. The browser ranks overlapping passages using weighted keyword retrieval and common student-language synonyms. Results quote original text and link to its actual PDF page. This is a handbook search tool, not a generative chatbot: it does not invent answers, send questions to a server, or claim to interpret policy. Unmatched questions show a fallback.

The downloaded collection says the school's online handbook remains binding. Replace both PDF and JSON together when updating policies. Source PDF supplied by the project owner; downloaded October 28, 2026.

## Files

- `dist/index.html`: accessible interface
- `dist/style.css`: responsive styles
- `dist/app.js`: local passage retrieval and interaction
- `dist/assets/`: source handbook and extracted text

Questions are kept only in the current page's memory. Google Fonts is used for typography with system fallbacks.
