import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { additionalQuestions } from '../content-drafts/expanded-question-bank.mjs';
import { studentWording } from '../content-drafts/student-wording.mjs';

const root = new URL('../', import.meta.url);
const draft = JSON.parse(await readFile(new URL('content-drafts/handbook-faq-v1.json', root)));
const pdf = await readFile(new URL('dist/assets/handbook.pdf', root));
assert.equal(createHash('sha256').update(pdf).digest('hex'), draft.source.pdf_sha256, 'Review sources again when replacing the handbook');
const questions = [...draft.questions, ...additionalQuestions].filter(q => q.publication_blockers.length === 0).map(q => ({
  id: q.id, category: q.category, question: q.question,
  alternative_wording: [...new Set([...q.alternative_wording, ...(studentWording[q.id] || [])])],
  short_answer: q.short_answer, conditions: [...q.conditions], sources: q.sources,
}));
const find = id => questions.find(q => q.id === id);
// Keep review instructions in the editorial draft, out of the student answers.
find('ATTENDANCE-01').short_answer = 'A parent or guardian should report the absence in AXIS, the preferred method. Absences must be cleared within 72 hours.';
find('ATTENDANCE-01').conditions[1] = 'If AXIS is unavailable, use the Attendance Office contact details in the current online handbook.';
find('INTEGRITY-01').conditions[3] = 'Ask your teacher for the full AI Philosophy and Guidelines and the instructions for your assignment.';
find('INTEGRITY-02').conditions.pop();
const bank = {
  source_date: draft.source.downloaded_date, content_review_date: '2026-11-02',
  pdf_sha256: draft.source.pdf_sha256,
  withheld_ids: draft.questions.filter(q => q.publication_blockers.length).map(q => q.id), questions,
};
assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
for (const id of Object.keys(studentWording)) assert.ok(questions.some(q => q.id === id), `Unknown wording target: ${id}`);
await writeFile(new URL('dist/assets/question-bank.json', root), JSON.stringify(bank, null, 2) + '\n');
console.log(`Prepared ${questions.length} answers and ${questions.reduce((n,q) => n + 1 + q.alternative_wording.length,0)} student question expressions; ${bank.withheld_ids.length} clarification holds excluded.`);
