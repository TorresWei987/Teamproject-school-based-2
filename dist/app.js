const topics = [['Dress code','What is the dress code?'],['Attendance','What do I do if I am absent or tardy?'],['Academics & grades','How are grades calculated?'],['Technology & AI','What is the policy on phones and artificial intelligence?'],['Student life','What clubs and student activities are available?'],['Safety & wellbeing','What are the campus security and safety procedures?']];
const $ = s => document.querySelector(s);
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeRequest=0,controller;

export function renderResults(data){
  if(data.decision==='supported'){
    if(!Array.isArray(data.passages)||!data.passages.length)throw Error('Missing passages');
    return '<p class="result-note">These original handbook passages address your question. Read the full policy for all conditions and exceptions.</p>'+data.passages.map(r=>{
      if(!Number.isInteger(r.page)||r.page<1||r.page>92||typeof r.section!=='string'||typeof r.text!=='string')throw Error('Invalid passage');
      return `<article class="result"><div class="result-top"><span>FROM YOUR HANDBOOK</span><span>PDF PAGE ${r.page}</span></div><h3>${escape(r.section)}</h3><p>${escape(r.text)}</p><a href="assets/handbook.pdf#page=${r.page}" target="_blank" rel="noopener">Read the full policy · Page ${r.page} ↗</a></article>`;
    }).join('');
  }
  if(data.decision==='clarify'){
    const c=data.clarification;
    if(!c||typeof c.question!=='string'||!Array.isArray(c.options)||!c.options.length)throw Error('Missing clarification');
    return `<article class="result"><h3>${escape(c.question)}</h3><p>Pick the school situation you mean so I can check the right handbook rule.</p><div class="clarification-options">${c.options.map(o=>`<button type="button" data-question="${escape(o.question)}">${escape(o.label)}</button>`).join('')}</div></article>`;
  }
  if(data.decision==='out_of_scope')return '<article class="result"><h3>I can help with school handbook rules.</h3><p>That question is outside the student handbook. Try asking about school dress code, attendance, phone use, or academic policies.</p></article>';
  if(data.decision==='not_covered')return '<article class="result"><h3>I couldn’t find a handbook rule that answers this.</h3><p>Missing information does not mean something is allowed. Try a more specific school-policy question, or ask your teacher or the school office.</p><a href="assets/handbook.pdf" target="_blank" rel="noopener">Open the full handbook ↗</a></article>';
  throw Error('Invalid check result');
}
function busy(value){
  $('#submit').disabled=value;
  $('#submit').innerHTML=value?'Checking the handbook…':'Ask a question <span>↗</span>';
  $('#results').setAttribute('aria-busy',String(value));
}
function render(question,markup){
  const area=$('#results');
  area.hidden=false;
  area.innerHTML=`<div class="section-heading"><h2>${escape(question)}</h2><button class="clear" id="clear" type="button">Clear</button></div>${markup}`;
  $('#clear').onclick=()=>{activeRequest++;controller?.abort();busy(false);area.hidden=true;$('#question').value='';$('#question').focus();};
}
export async function ask(question){
  question=question.trim();if(!question)return;
  controller?.abort();
  const requestId=++activeRequest,requestController=new AbortController();
  controller=requestController;
  $('#question').value=question;
  render(question,'<p class="result-note" role="status">Checking whether the handbook covers your question…</p>');
  busy(true);
  $('#results').scrollIntoView({behavior:'smooth',block:'start'});
  const timeout=setTimeout(()=>requestController.abort(),30000);
  try{
    const response=await fetch('/api/handbook-check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question}),signal:requestController.signal});
    if(!response.ok)throw Error('Check unavailable');
    const data=await response.json();
    if(requestId!==activeRequest)return;
    render(question,renderResults(data));
  }catch{
    if(requestId!==activeRequest)return;
    render(question,'<article class="result"><h3>I couldn’t check that question right now.</h3><p>Try again in a moment, or read the handbook directly.</p><a href="assets/handbook.pdf" target="_blank" rel="noopener">Open the full handbook ↗</a></article>');
  }finally{clearTimeout(timeout);if(requestId===activeRequest)busy(false);}
}
$('#topics').innerHTML=topics.map(([title,q])=>`<button data-question="${escape(q)}">${title}</button>`).join('');
document.addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)ask(b.dataset.question)});
$('#question-form').addEventListener('submit',e=>{e.preventDefault();ask($('#question').value)});
$('#question').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#question-form').requestSubmit()}});
$('#ask-nav').onclick=()=>{$('#question').focus();$('#question').scrollIntoView({behavior:'smooth',block:'center'})};
