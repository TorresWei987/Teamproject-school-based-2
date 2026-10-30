# Handbook — Student question finder

A responsive website for the Oaks Christian High School 2026–27 handbook. Ask a question, browse common topics, and open the cited PDF page.

## Run locally

```sh
npm run dev:handbook
```

Open http://127.0.0.1:3324. This runs the static website and its handbook-check endpoint together, without installing dependencies. The AI check needs a server-side `OPENAI_API_KEY`; for local work, put it in the ignored `.env` file. The PDF remains directly readable without a key. A plain static server cannot run the AI endpoint.

## Netlify deployment

Connect this repository's `main` branch to your Netlify team. The root `netlify.toml` publishes the committed `dist/` website, bundles the Netlify function, and runs retrieval and boundary tests before deployment. These file settings override the corresponding Netlify dashboard settings.

In Netlify's environment variables, add `OPENAI_API_KEY` as a secret for the Production context, available to Functions. Leave preview and local contexts empty unless you deliberately want to enable AI there. Redeploy after adding or changing the key. Optional `OPENAI_MODEL` changes the model; the default is `gpt-5.4-mini`. Never put API keys in `dist/`, frontend variables, commits, or chat messages.

Do not use `npm run build` for this website: it builds the separate React interface preview in `src/` and replaces `dist/`. Edit and commit the finished site's files in `dist/` for the current deployment workflow. New files inside this ignored folder need `git add -f dist/path/to/file`.

After a successful deployment, check the Lion’s Guide homepage, transparent school crest, a handbook search, and the PDF page links.

## How answers work

The original 92-page PDF is included in `dist/assets/handbook.pdf`. Its extracted page text is in `dist/assets/handbook.json`. The server ranks overlapping passages using weighted keyword retrieval and common student-language synonyms, then asks OpenAI whether the question is actually addressed by those passages.

The AI can select `supported`, `clarify`, `not_covered`, or `out_of_scope`. It cannot write the answer or a free-form follow-up question. Supported matches require a passage ID and a substantive quote verified against the server's own handbook. Clarifications are fixed, school-policy-only questions about phone use, clothing, attendance, or AI use in schoolwork, and require matching section evidence. The browser never supplies source passages. Missing coverage never means permission, and failed or unavailable checks never fall back to unchecked keyword matches.

Questions and relevant handbook excerpts are sent to OpenAI; the API request sets `store: false`. The app does not persist questions or conversation history and does not log their content. OpenAI's own data policies still apply. The endpoint limits question length, rejects cross-origin browser requests, and applies Netlify's per-IP/domain rate limit. Students should leave names and personal information out of questions.

Run `npm run test:handbook` for retrieval regressions and mocked provider/boundary tests. These tests check validation and UI behavior; live-model relevance must also be evaluated with a configured key. AI relevance judgments can make mistakes. Test valid, ambiguous, unsupported, unrelated-keyword, and prompt-injection questions before broad release.

The downloaded collection says the school's online handbook remains binding. Replace both PDF and JSON together when updating policies. Source PDF supplied by the project owner; downloaded October 28, 2026.

## Files

- `dist/index.html`: accessible interface
- `dist/style.css`: responsive styles
- `dist/app.js`: question, clarification, and result interface
- `dist/handbook-search.js`: shared handbook passage retrieval
- `netlify/functions/handbook-check.mjs`: server-side AI relevance check
- `dist/assets/`: source handbook and extracted text

Questions are kept only in the current page's memory. Google Fonts is used for typography with system fallbacks.
