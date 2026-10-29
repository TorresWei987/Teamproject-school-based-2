const topics = [['Dress code','What is the dress code?'],['Attendance','What do I do if I am absent or tardy?'],['Academics & grades','How are grades calculated?'],['Technology & AI','What is the policy on phones and artificial intelligence?'],['Student life','What clubs and student activities are available?'],['Safety & wellbeing','What are the campus security and safety procedures?']];
const $ = s => document.querySelector(s);
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stop = new Set('a an the is are was were to from in on at of for and or if it i my me we our you your can could do does what how when where why would should be about have has get am with as this that will'.split(' '));
const aliases = {hoodie:'hood sweatshirt dress',wear:'clothing dress attire',clothes:'clothing dress attire',late:'tardy tardiness',absent:'absence attendance',miss:'absence attendance',phone:'phone cell cellular technology',phones:'phone cell cellular technology',ai:'artificial intelligence academic integrity',homework:'assignments homework academic',cheat:'cheating plagiarism integrity',bully:'bullying harassment',grades:'grade grading gpa',clubs:'club activities',parking:'parking vehicle driving',sick:'illness absence attendance',lunch:'lunch food cafeteria',help:'support assistance',vape:'vaping tobacco smoking',hoodies:'hood sweatshirt dress'};
const words = s => s.toLowerCase().match(/[a-z0-9]+/g)||[];
const stem = s => s.length>4?s.replace(/(ing|es|s)$/,''):s;
let chunks=[];
const ready=fetch('assets/handbook.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(pages=>{
 let section='General information';
 for(const page of pages){
  if(page.page<6)continue;
  const marker=page.text.indexOf('Original handbook page');
  if(marker>=0)section=page.text.slice(0,marker).replace(/\s+/g,' ').trim();
  let clean=page.text.replace(/^.*?Original handbook page\s*/s, marker>=0?'':'$&').replace(/Oaks Christian School • High School Student Handbook — \d+ \/ 92/g,'').trim();
  const lines=clean.split('\n');
  for(let start=0;start<lines.length;start+=7){const text=lines.slice(start,start+11).join('\n').trim();if(text.length<65)continue;const terms=words(text+' '+section).map(stem);chunks.push({page:page.page,section,text,terms:new Set(terms)});}
 }
});
function search(query){
 const original=words(query).filter(w=>!stop.has(w));
 const expanded=new Set(original.flatMap(w=>[w,...(aliases[w]||'').split(' ')]).filter(Boolean).map(stem));
 if(!expanded.size)return [];
 const scored=chunks.map(c=>{let score=0;let hits=0;for(const w of expanded){if(c.terms.has(w)){const df=chunks.filter(x=>x.terms.has(w)).length;score+=Math.log(1+chunks.length/(1+df));hits++;}}for(const w of original){if(words(c.section).map(stem).includes(stem(w)))score+=2;}return {...c,score,hits};}).filter(c=>c.hits>=Math.min(2,expanded.size)&&c.score>2.8).sort((a,b)=>b.score-a.score);
 const results=[];for(const c of scored){if(!results.some(r=>r.page===c.page)){results.push(c);if(results.length===3)break;}}return results;
}
async function ask(q){
 q=q.trim();if(!q)return;$('#question').value=q;$('#submit').disabled=true;$('#submit').textContent='Finding passages…';const area=$('#results');area.hidden=false;
 try{await ready;const found=search(q);area.innerHTML=`<div class="section-heading"><h2>${escape(q)}</h2><button class="clear" id="clear">Clear</button></div>`+(found.length?`<p class="result-note">Here’s what the handbook says. These are matching original passages, not an AI-generated answer. Follow the page links for the full policy.</p>`+found.map(r=>`<article class="result"><div class="result-top"><span>FROM YOUR HANDBOOK</span><span>PDF PAGE ${r.page}</span></div><h3>${escape(r.section)}</h3><p>${escape(r.text)}</p><a href="assets/handbook.pdf#page=${r.page}" target="_blank" rel="noopener">Read the full policy · Page ${r.page} ↗</a></article>`).join(''):`<article class="result"><h3>I couldn’t find a confident match.</h3><p>Try a specific handbook topic such as “dress code”, “attendance”, or “grading”. For a situation the handbook doesn’t cover, ask your teacher or the school office.</p><a href="assets/handbook.pdf" target="_blank" rel="noopener">Open the full handbook ↗</a></article>`);$('#clear').onclick=()=>{area.hidden=true;$('#question').value='';$('#question').focus()};area.scrollIntoView({behavior:'smooth',block:'start'});
 }catch{area.innerHTML='<article class="result"><h3>The handbook couldn’t load.</h3><p>Please refresh and try again, or open the PDF directly.</p><a href="assets/handbook.pdf">Open handbook ↗</a></article>';}finally{$('#submit').disabled=false;$('#submit').innerHTML='Ask a question <span>↗</span>';}
}
$('#topics').innerHTML=topics.map(([title,q])=>`<button data-question="${escape(q)}">${title}</button>`).join('');
document.addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)ask(b.dataset.question)});
$('#question-form').addEventListener('submit',e=>{e.preventDefault();ask($('#question').value)});
$('#question').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#question-form').requestSubmit()}});
$('#ask-nav').onclick=()=>{$('#question').focus();$('#question').scrollIntoView({behavior:'smooth',block:'center'})};
export {search,ready};
