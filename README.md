# Lion’s Guide — handbook question finder

A responsive, English-only website for the Oaks Christian High School 2026–27 handbook. Students ask in their own words. Clear matches show a prepared answer with conditions and sources. Questions outside the question bank can automatically show relevant original handbook excerpts and PDF page links.

[Production website](https://ocs-handbooker.netlify.app/)

## How a question gets answered

1. The browser matches the student's wording against 64 source-backed answers and 831 curated question expressions, using synonyms, common abbreviations, and spelling variations.
2. A clear match displays the prepared answer immediately and preserves the student's original input.
3. Broad or mixed questions offer candidate questions for clarification.
4. If there is no clear prepared answer, the browser searches the full downloaded handbook. Strong matches automatically appear under **Related handbook passages**, with links to the exact PDF pages.
5. Questions with no suitable match offer topic browsing and a form for submitting a new question to the team.

| Example input | Expected behavior |
| --- | --- |
| Can I carry my switched off phone in my pocket? | Prepared phone-storage answer |
| Do I need a parking pass? | Original handbook excerpt from PDF page 90 |
| Can I get food deliveries at school? | Original handbook excerpt from PDF page 88 |
| phone | Clarification choices |
| How do I fix my phone screen? | No handbook match |

## Run and check

```sh
npm run prepare:handbook
npm run dev:handbook
```

Use Node.js 22.12 or later. Run the commands from this repository's root, then open http://127.0.0.1:3324. No dependency installation or API key is required for this static handbook website. Both matching methods run in the browser. Only sending the new-question form transmits its text for team review.

To use port 3323 in PowerShell, run `$env:PORT='3323'; npm run dev:handbook`.

```sh
npm run test:handbook
```

The current suite has 61 checks covering source consistency, held questions, student wording, direct answers, ambiguity, full-text fallback, irrelevant queries, stale results, escaping, failed downloads, and form submission failures. Browser checks also cover keyboard navigation and narrow layouts.

## Content and review

The question bank covers Dress Code, Attendance, Phones and Devices, and Academic Integrity and AI. Full-text search also reaches other handbook topics.

| File | What teammates should edit or review |
| --- | --- |
| `content-drafts/handbook-faq-v1.json` | Original answer drafts, conditions, source quotes, and clarification holds |
| `content-drafts/expanded-question-bank.mjs` | Additional source-backed questions and answers |
| `content-drafts/student-wording.mjs` | Different ways students might ask each question, grouped by question ID |
| `dist/question-bank.js` | Wording normalization, question matching, relevance checks, and answer rendering |
| `dist/handbook-search.js` | Full-text excerpt retrieval and combined response selection |
| `dist/app.js` | Search, browsing, results, and submission interactions |
| `dist/index.html` and `dist/style.css` | Student-facing layout and styles |

The HTML review copy in `content-drafts/handbook-faq-review.html` contains the original 24 drafts. Use the source files above and the running website to review the expanded bank.

To add an answer, use a unique question ID, include its conditions and exact source quotes with PDF page numbers, and add student expressions under the same ID. Run `npm run prepare:handbook` and `npm run test:handbook`, then commit both the edited source files and the generated `dist/assets/question-bank.json`. Edit the content sources instead of changing that generated file directly.

Three questions remain excluded: OCS branding on hats, the exact 15-minute tardy/absence boundary, and translator exceptions. Resolve their `publication_blockers` before adding them. Do not remove blockers simply to make a question visible.

`npm run prepare:handbook` creates `dist/assets/question-bank.json`, excluding blocked entries and removing internal editorial notes from student text. It verifies the source PDF hash. If the handbook is replaced, review the question bank and its references before updating the stored hash. Image-table excerpts on PDF page 39 were checked visually; text-excerpt consistency is checked automatically against the extracted page text.

The source is the 92-page downloaded collection from October 28, 2026, in `dist/assets/handbook.pdf`. Page links refer to that collection. The school’s online handbook remains binding; check it before a broad student launch. Suggestions are wording matches, not semantic understanding. Submitting a question shows an answer when the wording points clearly to a single entry. Uncertain matches offer choices.

When a submitted question has no clear prepared answer, `dist/handbook-search.js` searches the full extracted handbook and automatically shows up to three original excerpts with PDF page links. The fallback requires strong coverage of the question’s terms in the excerpt, filters navigation-only matches, and shares the question bank’s relevance and unresolved-policy checks. Broad or mixed questions can still require clarification. If the handbook download fails, prepared answers remain available and the interface reports that full search could not load.

## New-question review queue

The static `handbook-questions` form uses Netlify Forms with a honeypot. It collects only a question; names and email addresses are not required. The form explains that Netlify may retain technical metadata. Submitted questions remain in the team’s Netlify Forms inbox and do not update the question bank automatically.

Before production use:

1. Enable form detection in the Netlify project’s **Forms** section, then deploy this version.
2. Verify that `handbook-questions` appears as an active form.
3. Submit a clearly marked test question on the deployed site and confirm it arrives in the team’s inbox.
4. Agree who reviews submissions, how often, and how long they are retained.

Local previews cannot receive submissions and show an explicit message without claiming delivery. Production delivery has not been verified by local tests. Netlify instructions: https://docs.netlify.com/manage/forms/setup/

## Deployment

The existing Netlify project `ocs-handbooker` is connected to this repository's `main` branch and publishes the committed `dist/` folder. A push to `main` starts the configured deployment. `netlify.toml` runs `npm run prepare:handbook && npm run test:handbook` before publishing. No API environment variables are needed for the current answer flow.

Do not run `npm run build` for this website: it builds the separate React preview in `src/` and overwrites `dist/`. The handbook website is maintained directly in `dist/`. The ignore rules include its HTML, CSS, JavaScript, and question-bank data in normal Git changes.

Use `npm run dev:handbook` for the local handbook preview. The static server intentionally does not provide an AI endpoint or simulate a successful form submission.
