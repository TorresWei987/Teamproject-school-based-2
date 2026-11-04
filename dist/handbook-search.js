import { escapeHtml, isUnsupportedQuestion, tokenizeQuestion } from './question-bank.js';

const filler = new Set('go find getting obtain explain anything anyone here there please need require'.split(' '));
const equivalents = {
  eating:'food', eat:'food', foods:'food', snacks:'food', snack:'food',
  deliveries:'delivery', delivered:'delivery', deliver:'delivery', doordash:'delivery', ubereats:'delivery',
  visitors:'visitor', parents:'parent', checkin:'check', checking:'check',
  reservation:'reserve', reservations:'reserve', reservable:'reserve', reserving:'reserve',
  permits:'permit', skateboarding:'skateboard', rollerblading:'rollerblade',
  lanyards:'lanyard', lockers:'locker', books:'book', overdue:'late',
};
const isHeadingLine = line => /^[A-Z]/.test(line) && line.length < 72 && line.split(/\s+/).length <= 8 && !/[.!?;,]$/.test(line.trim());

function passageTerms(text) {
  const normalized = text.replace(/front office/gi, 'front reception desk')
    .replace(/(?:order\s+)?pizza(?=\s+delivery)/gi, 'food');
  return [...new Set(tokenizeQuestion(normalized).map(word => {
    if (Object.hasOwn(equivalents, word)) return equivalents[word];
    if (word.length > 5 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  }).filter(word => !filler.has(word)))];
}

export function createPassageSearch(pages) {
  const chunks = [];
  let section = 'General information';
  for (const page of pages) {
    if (!Number.isInteger(page.page) || page.page < 6 || page.page > 92 || typeof page.text !== 'string') continue;
    const marker = page.text.indexOf('Original handbook page');
    if (marker >= 0) section = page.text.slice(0, marker).replace(/\s+/g, ' ').trim();
    const body = (marker >= 0 ? page.text.slice(marker + 'Original handbook page'.length) : page.text)
      .replace(/Oaks Christian School • High School Student Handbook — \d+ \/ 92/g, '').trim();
    let lines = body.split('\n');
    // New sections repeat their first heading after a navigation list. Start at the actual section.
    const repeatedHeading = marker >= 0 ? lines.findIndex((line, index) => index > 0 && line.trim() === lines[0].trim()) : -1;
    if (repeatedHeading > 0) lines = lines.slice(repeatedHeading);
    const blocks = [];
    let block = [];
    for (const line of lines) {
      const heading = isHeadingLine(line);
      if (heading && block.length) { blocks.push(block); block = []; }
      block.push(line);
    }
    blocks.push(block);
    for (const blockLines of blocks) for (let start = 0; start < blockLines.length; start += 7) {
      let text = blockLines.slice(start, start + 12).join('\n').trim();
      if (!/[.!?]$/.test(text)) {
        const sentenceEnd = Math.max(text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
        if (sentenceEnd >= 120) text = text.slice(0, sentenceEnd + 1);
      }
      if (text.length < 65) continue;
      const policyText = text.split('\n').filter(line => line.length > 75 || (/[.!?;:]$/.test(line.trim()) && !/etc\.$/.test(line.trim()))).join('\n');
      chunks.push({page:page.page, section, text, terms:new Set(passageTerms(text)), policyTerms:new Set(passageTerms(policyText))});
    }
  }
  const frequency = new Map();
  for (const chunk of chunks) for (const term of chunk.terms) {
    if (!frequency.has(term)) frequency.set(term, new Set());
    frequency.get(term).add(chunk.page);
  }
  const weight = term => Math.log(1 + pages.length / (1 + (frequency.get(term)?.size || 0)));

  return query => {
    if (isUnsupportedQuestion(query)) return [];
    const terms = passageTerms(query);
    if (!terms.length) return [];
    // A single word can open a specific handbook topic, but general words require more context.
    if (terms.length === 1 && (terms[0].length < 5 || (frequency.get(terms[0])?.size || 0) > 4)) return [];
    const totalWeight = terms.reduce((sum, term) => sum + weight(term), 0);
    const scored = chunks.map(chunk => {
      const matches = terms.filter(term => chunk.terms.has(term));
      const matchedWeight = matches.reduce((sum, term) => sum + weight(term), 0);
      const hasBodyMatch = terms.some(term => chunk.policyTerms.has(term));
      return {chunk, coverage:matchedWeight / totalWeight, score:matchedWeight, hasBodyMatch};
    }).filter(result => result.hasBodyMatch && result.coverage >= .9 && result.score > 2.8)
      .sort((a, b) => b.coverage - a.coverage || b.score - a.score);
    const results = [];
    for (const {chunk} of scored) {
      if (results.some(result => result.page === chunk.page)) continue;
      results.push({page:chunk.page, section:chunk.section, text:chunk.text});
      if (results.length === 3) break;
    }
    return results;
  };
}

export function resolveHandbookQuestion(query, questionSearch, passageSearch) {
  const result = questionSearch.resolve(query);
  if (result.decision === 'answer') return result;
  const asksSeveralThings = /\b(?:and|also)\b/i.test(query) && result.suggestions.length >= 2;
  if (result.decision === 'clarify' && (questionSearch(query).length >= 2 || asksSeveralThings)) return result;
  const passages = passageSearch ? passageSearch(query) : [];
  return passages.length ? {decision:'passages', passages} : result;
}

export function renderPassages(passages) {
  for (const passage of passages) {
    if (!Number.isInteger(passage.page) || passage.page < 1 || passage.page > 92) throw Error('Invalid handbook page');
  }
  return `<div class="section-heading"><h2 id="answer-heading" tabindex="-1">Related handbook passages</h2><button class="clear" type="button" data-action="back">Back to questions</button></div>
    <p class="result-note">These original excerpts may help with your question. Read the linked pages for the full policy, including conditions and exceptions.</p>
    ${passages.map(passage => {
      const [firstLine, ...rest] = passage.text.split('\n');
      const hasHeading = isHeadingLine(firstLine);
      const title = hasHeading ? firstLine : passage.section;
      const body = hasHeading ? rest.join('\n') : passage.text;
      return `<article class="result"><div class="result-top"><span>ORIGINAL HANDBOOK EXCERPT</span><span>PDF PAGE ${passage.page}</span></div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><a href="assets/handbook.pdf#page=${passage.page}" target="_blank" rel="noopener">Read the full policy · Page ${passage.page} ↗</a></article>`;
    }).join('')}
    <div class="no-match"><p>Still looking for an answer?</p><button type="button" class="text-button" data-action="submit-question">Send a new question ↗</button></div>`;
}
