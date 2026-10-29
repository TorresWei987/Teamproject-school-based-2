# Handbook — Student question finder

A responsive website for the Oaks Christian High School 2026–27 handbook. Ask a question, browse common topics, and open the cited PDF page.

## Run locally

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. No build, API key, account, or backend is required. Deploy `dist/` to any static host.

## How answers work

The original 92-page PDF is included in `dist/assets/handbook.pdf`. Its extracted page text is in `dist/assets/handbook.json`. The browser ranks overlapping passages using weighted keyword retrieval and common student-language synonyms. Results quote original text and link to its actual PDF page. This is a handbook search tool, not a generative chatbot: it does not invent answers, send questions to a server, or claim to interpret policy. Unmatched questions show a fallback.

The downloaded collection says the school's online handbook remains binding. Replace both PDF and JSON together when updating policies. Source PDF supplied by the project owner; downloaded October 28, 2026.

## Files

- `dist/index.html`: accessible interface
- `dist/style.css`: responsive styles
- `dist/app.js`: local passage retrieval and interaction
- `dist/assets/`: source handbook and extracted text

Questions are kept only in the current page's memory. Google Fonts is used for typography with system fallbacks.
