import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bank = JSON.parse(await readFile(new URL('../dist/assets/question-bank.json', import.meta.url)));
const pages = JSON.parse(await readFile(new URL('../dist/assets/handbook.json', import.meta.url)));
const elements = new Map();
const listeners = new Map();
const calls = [];
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, {
    value:'', innerHTML:'', textContent:'', hidden:true, disabled:true, listeners:new Map(),
    addEventListener(name, fn) { this.listeners.set(name, fn); },
    focus() { document.activeElement = this; }, scrollIntoView() {}, reset() {},
    showModal() { this.open = true; }, close() { this.open = false; },
  });
  return elements.get(selector);
}
globalThis.document = {
  activeElement:null, querySelector:element, querySelectorAll:() => [],
  addEventListener(name, fn) { listeners.set(name, fn); },
};
globalThis.fetch = async url => {
  calls.push(url);
  assert.ok(['assets/question-bank.json', 'assets/handbook.json'].includes(url));
  return Response.json(url === 'assets/question-bank.json' ? bank : pages);
};
const { ready, submitQuestion } = await import('../dist/app.js');
await ready;
const type = value => { element('#question').value = value; element('#question').listeners.get('input')(); };
const click = dataset => listeners.get('click')({target:{closest:() => ({dataset})}});

test('submitting a clear question shows the answer and preserves the student wording', () => {
  type('phone at lunch');
  assert.match(element('#suggestion-list').innerHTML, /PHONE-01/);
  assert.equal(element('#results').hidden, true);
  element('#question-form').listeners.get('submit')({preventDefault(){}});
  assert.equal(element('#results').hidden, false);
  assert.equal(element('#question').value, 'phone at lunch');
  assert.match(element('#results').innerHTML, /8:30 a\.m\. to 3:15 p\.m\./);
  assert.equal(document.activeElement, element('#answer-heading'));
  type('How do I fix my phone screen?');
  assert.equal(element('#results').hidden, true);
  assert.equal(element('#results').innerHTML, '');
  assert.equal(element('#suggestion-list').innerHTML, '');
});
test('an ambiguous submission asks for clarification before answering', () => {
  type('phone');
  element('#question-form').listeners.get('submit')({preventDefault(){}});
  assert.equal(element('#results').hidden, true);
  assert.match(element('#suggestion-list').innerHTML, /PHONE-01/);
  assert.match(element('#suggestion-list').innerHTML, /PHONE-02/);
  click({id:'PHONE-02'});
  assert.equal(element('#results').hidden, false);
});
test('category browsing lists questions without answering and excludes holds', () => {
  click({category:'Dress Code'});
  assert.equal(element('#question-list').hidden, false);
  assert.equal(element('#results').hidden, true);
  assert.match(element('#category-questions').innerHTML, /DRESS-01/);
  assert.ok(!element('#category-questions').innerHTML.includes('DRESS-04'));
  click({action:'browse'});
  assert.equal(element('#browse').hidden, false);
  assert.equal(element('#question-list').hidden, true);
});
test('question submission opens with the current wording and no answer is invented', () => {
  type('Can I bring my dog to school?');
  click({action:'submit-question'});
  assert.equal(element('#new-question').value, 'Can I bring my dog to school?');
  assert.equal(element('#submission-dialog').open, true);
  assert.equal(element('#results').hidden, true);
});
test('search and answer selection make no AI or question submission requests', () => {
  assert.deepEqual(calls, ['assets/question-bank.json', 'assets/handbook.json']);
});
test('a question outside the bank automatically shows original passages', () => {
  type('Do I need a parking pass?');
  element('#question-form').listeners.get('submit')({preventDefault(){}});
  assert.equal(element('#results').hidden, false);
  assert.match(element('#results').innerHTML, /Related handbook passages/);
  assert.match(element('#results').innerHTML, /handbook\.pdf#page=90/);
  assert.equal(element('#question').value, 'Do I need a parking pass?');
  type('How do I fix my phone screen?');
  element('#question-form').listeners.get('submit')({preventDefault(){}});
  assert.equal(element('#results').hidden, true);
  assert.equal(element('#results').innerHTML, '');
});
test('keyboard users can enter suggestions, move between them, and return to search', () => {
  type('phone');
  element('#question').listeners.get('keydown')({key:'ArrowDown',preventDefault(){}});
  assert.equal(document.activeElement, element('#suggestion-list button'));
  const options = [element('first-option'), element('second-option')];
  const list = {querySelectorAll:() => options};
  options.forEach(option => { option.closest = () => list; });
  const key = (option, value) => listeners.get('keydown')({key:value,target:{closest:() => option},preventDefault(){}});
  key(options[0], 'ArrowDown');
  assert.equal(document.activeElement, options[1]);
  key(options[0], 'ArrowUp');
  assert.equal(document.activeElement, options[1]);
  key(options[1], 'Escape');
  assert.equal(document.activeElement, element('#question'));
});
test('local submission reports unavailable and never pretends to save', async () => {
  await assert.rejects(submitQuestion({}, {hostname:'127.0.0.1',send:() => { throw Error('Must not send'); }}), /has not been sent/);
});
test('Netlify submission sends only form fields; errors preserve failure status', async () => {
  const NativeFormData = globalThis.FormData;
  globalThis.FormData = class { *[Symbol.iterator]() { yield ['form-name','handbook-questions']; yield ['question','A school question?']; yield ['bot-field','']; } };
  try {
    const send = async (url, init) => {
      assert.equal(url, '/'); assert.equal(init.method, 'POST');
      assert.equal(init.headers['Content-Type'], 'application/x-www-form-urlencoded');
      assert.deepEqual(Object.fromEntries(new URLSearchParams(init.body)), {'form-name':'handbook-questions',question:'A school question?','bot-field':''});
      return new Response('', {status:200});
    };
    await submitQuestion({}, {hostname:'ocs-handbooker.netlify.app',send});
    await assert.rejects(submitQuestion({}, {hostname:'ocs-handbooker.netlify.app',send:async() => new Response('',{status:500})}), /not sent/);
  } finally { globalThis.FormData = NativeFormData; }
});
test('deployment includes a static detectable form and no AI function', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /name="handbook-questions"[^>]*data-netlify="true"/);
  assert.match(html, /name="form-name" value="handbook-questions"/);
  assert.match(html, /name="bot-field"/);
  assert.ok(!/type="email"|name="email"|name="name"/.test(html));
  await assert.rejects(readFile(new URL('../netlify/functions/handbook-check.mjs', import.meta.url)), {code:'ENOENT'});
});
test('a failed bank download displays a visible recovery message', async () => {
  const originalFetch = globalThis.fetch;
  elements.clear();
  globalThis.fetch = async () => new Response('', {status:503});
  try {
    const failedApp = await import('../dist/app.js?failed-download');
    await failedApp.ready;
    assert.equal(element('#search-status').className, 'load-error');
    assert.match(element('#search-status').textContent, /refresh the page or open the handbook/);
    assert.equal(element('#question').disabled, true);
  } finally { globalThis.fetch = originalFetch; }
});
test('prepared answers still work when the full handbook download fails', async () => {
  const originalFetch = globalThis.fetch;
  elements.clear();
  globalThis.fetch = async url => url === 'assets/question-bank.json' ? Response.json(bank) : new Response('', {status:503});
  try {
    const app = await import('../dist/app.js?passages-unavailable');
    await app.ready;
    type('phone at lunch');
    element('#question-form').listeners.get('submit')({preventDefault(){}});
    assert.equal(element('#results').hidden, false);
    type('Do I need a parking pass?');
    element('#question-form').listeners.get('submit')({preventDefault(){}});
    assert.match(element('#suggestion-hint').textContent, /Full handbook search could not load/);
  } finally { globalThis.fetch = originalFetch; }
});
