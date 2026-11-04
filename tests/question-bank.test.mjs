import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createQuestionSearch, renderAnswer } from '../dist/question-bank.js';
import { additionalQuestions } from '../content-drafts/expanded-question-bank.mjs';

const bank = JSON.parse(await readFile(new URL('../dist/assets/question-bank.json', import.meta.url)));
const draft = JSON.parse(await readFile(new URL('../content-drafts/handbook-faq-v1.json', import.meta.url)));
const pages = JSON.parse(await readFile(new URL('../dist/assets/handbook.json', import.meta.url)));
const search = createQuestionSearch(bank.questions);
const normalize = value => value.replace(/-\r?\n\s*/g, '-').replace(/\s+/g, ' ').trim();

test('the expanded question bank excludes all three unresolved policies', () => {
  assert.equal(bank.questions.length, 64);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, bank.questions.length);
  assert.deepEqual(bank.withheld_ids, ['DRESS-04', 'ATTENDANCE-02', 'INTEGRITY-03']);
  assert.equal(new Set(bank.questions.map(q => q.category)).size, 4);
  for (const q of bank.questions) {
    assert.equal([...draft.questions, ...additionalQuestions].find(d => d.id === q.id).publication_blockers.length, 0);
    assert.ok(q.question && q.short_answer && q.conditions.length && q.sources.length);
    assert.ok(!q.conditions.some(c => /before publication|this draft|handbook\.json/.test(c)));
  }
});
test('text excerpts match their cited page and the PDF is the reviewed source', async () => {
  const pdf = await readFile(new URL('../dist/assets/handbook.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(pdf).digest('hex'), bank.pdf_sha256);
  for (const q of bank.questions) for (const source of q.sources) {
    assert.ok(Number.isInteger(source.page) && source.page >= 1 && source.page <= 92);
    if (source.kind === 'visual_table_transcription') {
      assert.equal(source.page, 39, 'Image-table quotations were visually checked on page 39');
    } else {
      const page = pages.find(p => p.page === source.page);
      assert.ok(normalize(page.text).includes(normalize(source.quote)), `${q.id}: quotation missing on page ${source.page}`);
    }
  }
});
for (const [query, id] of [
  ['Can I wear a hoodie?', 'DRESS-01'], ['hood', 'DRESS-01'], ['hoddie', 'DRESS-01'],
  ['sweatshirts', 'DRESS-01'], ['Can I wear Crocs?', 'DRESS-03'],
  ['phone at lunch', 'PHONE-01'], ['Can my phone stay in my backpack?', 'PHONE-02'],
  ['headphones', 'PHONE-03'], ['AI', 'INTEGRITY-01'], ['Can I use ChatGPT for homework?', 'INTEGRITY-01'],
  ['Does paraphrasing need a citation?', 'INTEGRITY-06'],
  ['How do I report an absence?', 'ATTENDANCE-01'], ['late traffic', 'ATTENDANCE-03'],
]) test(`student wording finds the intended question: ${query}`, () => {
  assert.equal(search(query)[0]?.id, id);
});
for (const query of [
  'How do I fix my phone screen?', 'What happens if I am late for my flight?',
  'Can I use AI to make a pizza?', 'quantum spaceship dinosaur recipes',
  'Can I wear a hat?', 'exactly 15 minutes late', 'Google Translate', '<script>alert(1)</script>', '', 'a',
]) test(`uncovered wording does not return an answer or unrelated suggestion: ${query}`, () => {
  assert.deepEqual(search(query), []);
});
test('vague phone search offers separate questions, capped at five', () => {
  const results = search('phone');
  assert.ok(results.length >= 2 && results.length <= 5);
  assert.ok(results.some(q => q.id === 'PHONE-01'));
  assert.ok(results.some(q => q.id === 'PHONE-02'));
});
test('every standard question and curated alternative can find its own entry', () => {
  for (const q of bank.questions) for (const wording of [q.question, ...q.alternative_wording]) {
    assert.ok(search(wording).some(result => result.id === q.id), `${q.id}: ${wording}`);
  }
});
test('submitted paraphrases resolve directly while mixed and unsupported questions do not', () => {
  for (const [wording, id] of [
    ['Can I use my cellphone at lunch?', 'PHONE-01'],
    ['Can I carry my switched off phone in my pocket?', 'PHONE-02'],
    ['Are university hoodies okay for seniors?', 'DRESS-01'],
    ['I am 22 minutes late to class', 'ATTENDANCE-20'],
  ]) assert.equal(search.resolve(wording).question?.id, id, wording);
  for (const wording of ['phone', 'What if I am late?', 'Can I wear a hoodie and Crocs?']) {
    assert.equal(search.resolve(wording).decision, 'clarify', wording);
  }
  for (const wording of ['How do I fix my phone screen?', 'Can I use my phone after school?', 'I am exactly 15 minutes late', 'Google Translate', 'constructor prototype']) {
    assert.equal(search.resolve(wording).decision, 'not_covered', wording);
  }
});
test('answer escapes text and links every source to the exact PDF page', () => {
  const q = bank.questions.find(q => q.id === 'PHONE-02');
  const html = renderAnswer(q);
  assert.match(html, /handbook\.pdf#page=70/);
  assert.match(html, /What to keep in mind/);
  const hostile = '<img src=x onerror=bad()>';
  const safe = renderAnswer({...q, question: hostile, short_answer: hostile, conditions:[hostile], sources:[{page:70,section:hostile,quote:hostile}]});
  assert.ok(!safe.includes('<img'));
  assert.match(safe, /&lt;img/);
});
