import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createQuestionSearch } from '../dist/question-bank.js';
import { createPassageSearch, resolveHandbookQuestion, renderPassages } from '../dist/handbook-search.js';

const pages = JSON.parse(await readFile(new URL('../dist/assets/handbook.json', import.meta.url)));
const bank = JSON.parse(await readFile(new URL('../dist/assets/question-bank.json', import.meta.url)));
const search = createQuestionSearch(bank.questions);
const passageSearch = createPassageSearch(pages);
const resolve = query => resolveHandbookQuestion(query, search, passageSearch);

for (const [query, page] of [
  ['Do I need a parking pass?', 90],
  ['Can I eat food in the library?', 42],
  ['Do visitors check in at the front office?', 87],
  ['Can I get food deliveries at school?', 88],
  ['Can I order pizza delivery to campus?', 88],
  ['Where is lost and found?', 91],
  ['Can I reserve a study room?', 42],
]) test(`automatically retrieves source text for an uncovered topic: ${query}`, () => {
  const result = resolve(query);
  assert.equal(result.decision, 'passages');
  assert.equal(result.passages[0].page, page);
  assert.ok(result.passages.length <= 3);
  for (const passage of result.passages) {
    assert.ok(pages.find(source => source.page === passage.page).text.includes(passage.text));
    assert.match(passage.text, /[.!?]$/);
  }
});
test('heading-only matches are excluded from source results', () => {
  assert.ok(!passageSearch('Can I skateboard on campus?').some(passage => passage.page === 90));
});
test('a food delivery excerpt stops at the next policy heading', () => {
  const [passage] = passageSearch('Can I get food deliveries at school?');
  assert.match(passage.text, /parents may personally deliver/);
  assert.ok(!passage.text.includes('Rideshare Services'));
});
test('prepared answers take priority and ambiguity still offers choices', () => {
  assert.equal(resolve('Can I use my phone at lunch?').decision, 'answer');
  assert.equal(resolve('phone').decision, 'clarify');
  assert.equal(resolve('Can I wear a hoodie and Crocs?').decision, 'clarify');
});
for (const query of [
  'How do I fix my phone screen?', 'What happens if I am late for my flight?',
  'Can I use AI to make a pizza?', 'Can I use my phone after school?',
  'Can I wear an OCS hat?', 'I am exactly 15 minutes late', 'Google Translate',
  'Can I repair a parking sensor?', 'How do I cook library books?',
]) test(`full text does not bypass relevance or unresolved-policy checks: ${query}`, () => {
  assert.deepEqual(passageSearch(query), []);
  assert.notEqual(resolve(query).decision, 'passages');
});
test('source rendering escapes content and validates page links', () => {
  const markup = renderPassages([{page:90,section:'<script>bad()</script>',text:'<img src=x onerror=bad()>'}]);
  assert.match(markup, /&lt;script/);
  assert.ok(!markup.includes('<img'));
  assert.match(markup, /handbook\.pdf#page=90/);
  assert.throws(() => renderPassages([{page:'90" onclick="bad()'}]), /Invalid handbook page/);
});
