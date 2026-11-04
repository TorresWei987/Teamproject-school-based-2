const stop = new Set('a an the is are was were to from in on at of for and or if it i my me we our you your can could do does what how when where why would should be about have has get am with as this that will may must allowed allow use using wear wearing school campus class classes day normal during still need happens happen time okay ok permitted rule rules policy handbook please just really actually wondering want know tell say says saying someone something person students student oaks ocs high today now hey hi thanks thank you some any ever always its im ive dont not didnt cannot cannt'.split(' '));
const aliases = {
  hoodies: 'hoodie', sweatshirts: 'hoodie', sweatshirt: 'hoodie',
  cellphone: 'phone', cellphones: 'phone', phones: 'phone', mobile: 'phone',
  airpods: 'earbud', earbuds: 'earbud', headphones: 'earbud',
  tardy: 'late', tardiness: 'late', absences: 'absence', absent: 'absence',
  trousers: 'pants', sweatpants: 'jogger', joggers: 'jogger',
  colour: 'color', colours: 'color', colors: 'color', grey: 'gray',
  chatgpt: 'ai', citation: 'cite', citations: 'cite', citing: 'cite',
  acknowledgement: 'acknowledge', acknowledgment: 'acknowledge',
  essays: 'essay', projects: 'project', assignments: 'assignment',
  copying: 'copy', copied: 'copy', paraphrasing: 'paraphrase',
  uni:'college', university:'college', universities:'college', collegiate:'college', colleges:'college',
  freshman:'freshman', freshmen:'freshman', sophomores:'sophomore', juniors:'junior', seniors:'senior',
  u:'you', ur:'your', r:'are', pls:'please', plz:'please', bc:'because', cuz:'because', rn:'now',
  permitted:'allowed', acceptable:'allowed', allowed:'allowed', allowedness:'allowed',
  clothing:'clothes', outfits:'clothes', polos:'polo', oxfords:'oxford',
  permission:'approve', approved:'approve', approval:'approve', approving:'approve',
  parents:'parent', guardian:'parent', guardians:'parent', mom:'parent', mum:'parent', dad:'parent', mother:'parent', father:'parent',
  laptop:'computer', laptops:'computer', computers:'computer', ipads:'tablet', ipad:'tablet', tablets:'tablet',
  homework:'assignment', schoolwork:'assignment', work:'assignment', coursework:'assignment',
  submitted:'submit', submitting:'submit',
  assessment:'test', assessments:'test', exam:'test', exams:'test', examination:'test', examinations:'test', quizzes:'quiz',
  quotations:'quote', quotation:'quote', quotes:'quote', quoting:'quote', crediting:'cite', credit:'credit',
  cited:'cite', sources:'source', summarizing:'summarize', summarising:'summarize', summaries:'summarize',
  notify:'report', notifying:'report', notification:'report', reporting:'report', reported:'report',
  tardies:'late', lateness:'late', arriving:'arrive', arrived:'arrive', arrival:'arrive',
  missing:'miss', missed:'miss', skipped:'skip', skipping:'skip',
  taken:'confiscate', confiscated:'confiscate', confiscation:'confiscate', confiscations:'confiscate',
  offense:'offense', offences:'offense', offenses:'offense', offence:'offense', violations:'offense', violation:'offense',
  teachers:'teacher', faculty:'teacher', staff:'teacher',
  cellular:'phone', cell:'phone', texting:'text', texts:'text',
  carry:'keep', carrying:'keep',
  airpod:'earbud', headset:'earbud', headsets:'earbud',
  glasses:'glass', videos:'video', images:'image', photos:'photo', photograph:'photo', photographing:'photo', picture:'photo', pictures:'photo',
  records:'record', recording:'record', recorded:'record', filming:'record', film:'record',
  borrow:'share', borrowing:'share', borrowed:'share', sharing:'share', shared:'share',
  logins:'login', credentials:'login', passwords:'password', username:'login', usernames:'login',
  network:'wifi', wireless:'wifi', wifi:'wifi', internet:'internet',
  shop:'buy', shopping:'buy', purchase:'buy', purchasing:'buy', buying:'buy', selling:'sell',
  pierced:'piercing', piercings:'piercing', tattoos:'tattoo', tattooed:'tattoo',
  sweats:'jogger', shorts:'shorts', sweaters:'sweater', cardigans:'cardigan',
  deadlines:'deadline', deadline:'deadline', required:'require', requires:'require', requirement:'require',
  immediately:'immediately', beforehand:'before', afterward:'after', afterwards:'after',
};
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const numberWords = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40};
function normalize(value) {
  return value.toLowerCase().replace(/[’']/g, '').replace(/\b(?:ucla|usc|stanford|harvard|yale|berkeley|pepperdine)\b/g,'college')
    .replace(/\b(?:nike|adidas|champion|lululemon|non-school)\b/g,'nonocs')
    .replace(/\bwi[ -]fi\b/g,'wifi').replace(/\b(?:chat gpt|chatgpt|gemini|claude|chatbot|llms?|artificial intelligence)\b/g,'ai')
    .replace(/\bturn(?:ing)? in\b/g,'submit').replace(/\bpick(?:ing)? up\b/g,'collect').replace(/\bput(?:ting)? on\b/g,'wear')
    .replace(/\b(?:switched|turned)[ -]off\b/g,'off')
    .replace(/\b1st\b/g,'first').replace(/\b2nd\b/g,'second').replace(/\b3rd\b/g,'third').replace(/\b4th\b/g,'fourth').replace(/\b5th\b/g,'fifth').replace(/\b6th\b/g,'sixth')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty)\b/g,w=>String(numberWords[w]))
    .replace(/\b(?:less than|under) 15[ -](?:minutes?|mins?)\b/g,'underfifteen')
    .replace(/\b(?:more than|over|beyond) 15[ -](?:minutes?|mins?)\b/g,'overfifteen')
    .replace(/\b(\d+)[ -](?:minutes?|mins?)[ -](?:late|tardy|late arrival)\b/g,(_,n)=>Number(n)<15?'underfifteen late':Number(n)>15?'overfifteen late':'exactfifteen late');
}
const tokens = value => [...new Set((normalize(value).match(/[a-z0-9]+/g) || [])
  .map(w=>Object.hasOwn(aliases,w)?aliases[w]:w).filter(w => !stop.has(w)))];
export { tokens as tokenizeQuestion };

export function isUnsupportedQuestion(query) {
  const text = normalize(query);
  if (/\b(?:hat|hats|visor|visors|translator|translate|translation)\b|\bhood (?:up|indoors)\b/.test(text)) return true;
  if (/\b(?:exactfifteen|15[ -](?:minutes?|mins?))\b/.test(text) && /\b(?:late|tardy|arrive|arriving)\b/.test(text)) return true;
  if (/\b(?:fix|repair|broken|cracked|battery|charger|charging)\b/.test(text) && /\b(?:phone|cellphone|computer|laptop|screen|wifi)\b/.test(text)) return true;
  if (/\b(?:flight|airport|recipe|spaceship|dinosaur|legally|lawsuit)\b|ignore (?:all|previous|the) instructions/.test(text)) return true;
  if (/\bpizza\b/.test(text) && !/\b(?:delivery|deliver|delivered|order)\b/.test(text)) return true;
  return /\b(?:phone|cellphone|earbuds|airpods)\b/.test(text) && /\b(?:at home|weekend|before school|after school|after 3[:.]15|before 8[:.]30)\b/.test(text) && !/\b(?:confiscat|collect|offense|student life)/.test(text);
}
function oneEditApart(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const differences = [...a].map((c,i)=>c===b[i]?-1:i).filter(i=>i>=0);
    if (differences.length <= 1) return true;
    if (differences.length === 2) { const [i,j]=differences; return j===i+1 && a[i]===b[j] && a[j]===b[i]; }
    return false;
  }
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}
export function createQuestionSearch(questions) {
  const index = questions.map(q => ({q, variants: [q.question, ...q.alternative_wording].map(tokens)}));
  const frequency = new Map();
  for (const item of index) for (const word of new Set(item.variants.flat())) frequency.set(word,(frequency.get(word)||0)+1);
  const weight = word => Math.log(1 + questions.length / (1 + (frequency.get(word)||0)));
  const total = words => words.reduce((sum,w)=>sum+weight(w),0);
  function rank(query, prefix = true) {
    const terms = tokens(query);
    if (!terms.length || query.trim().length < 2 || isUnsupportedQuestion(query)) return [];
    const queryWeight = total(terms);
    return index.map(({q,variants}) => {
      let best={score:0,coverage:0,exact:false};
      for (const words of variants) {
        let matched = 0;
        for (const term of terms) {
          if (words.includes(term)) matched += weight(term);
          else if (term.length >= 5 && words.some(w=>w.length>=5 && oneEditApart(term,w))) matched += weight(term)*.86;
          else if (prefix && term.length>=3 && words.some(w=>w.startsWith(term))) matched += weight(term)*.72;
        }
        const coverage=matched/queryWeight;
        const exact=terms.length===words.length && terms.every(w=>words.includes(w));
        const score=.75*coverage + .25*(2*matched/(queryWeight+total(words)));
        if (score>best.score) best={score,coverage,exact};
      }
      return {q,...best};
    }).filter(r=>r.coverage>=.4).sort((a,b)=>b.score-a.score);
  }
  const search=(query,limit=5)=>rank(query).filter(r=>r.coverage>=.6).slice(0,limit).map(r=>r.q);
  search.resolve = query => {
    const ranked=rank(query,false), terms=tokens(query);
    const suggestions=ranked.filter(r=>r.coverage>=.4).slice(0,5).map(r=>r.q);
    if (!ranked.length) return {decision:'not_covered',suggestions:[]};
    const [first,second]=ranked;
    const broad=terms.length===1 && ['phone','ai','absence','late','uniform','test','computer','integrity','clothes','approve'].includes(terms[0]);
    const exact=ranked.filter(r=>r.exact);
    // shortcut: lexical coverage is not general language understanding; expand real student examples after review.
    const clear=!broad && ((exact.length===1 && first.exact) || (first.coverage>=.86 && first.score>=.83 && (!second || first.score-second.score>=.12)));
    return clear ? {decision:'answer',question:first.q,suggestions} : {decision:'clarify',suggestions};
  };
  return search;
}
export function renderAnswer(q) {
  const esc = escapeHtml;
  return `<article class="answer-card">
    <div class="answer-top"><span>${esc(q.category)}</span><button class="clear" type="button" data-action="back">Back to questions</button></div>
    <h2 id="answer-heading" tabindex="-1">${esc(q.question)}</h2>
    <p class="short-answer">${esc(q.short_answer)}</p>
    <h3>What to keep in mind</h3>
    <ul class="conditions">${q.conditions.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <details class="source-details"><summary>Read the handbook excerpts <span>PDF ${[...new Set(q.sources.map(s => s.page))].map(p => `p. ${p}`).join(', ')}</span></summary>
    ${q.sources.map(s => `<div class="source-excerpt"><p class="source-section">${esc(s.section)}</p><blockquote>${esc(s.quote)}</blockquote><a href="assets/handbook.pdf#page=${s.page}" target="_blank" rel="noopener">Open PDF page ${s.page} <span aria-hidden="true">↗</span></a></div>`).join('')}</details>
    <p class="answer-note">A handbook summary, not individual permission. If your situation is different, check with your teacher or the Office of Student Life.</p>
  </article>`;
}
