const stop = new Set('a an the is are was were to from in on at of for and or if it i my me we our you your can could do does what how when where why would should be about have has get am with as this that will'.split(' '));
const aliases = {hoodie:'hood sweatshirt dress',wear:'clothing dress attire',clothes:'clothing dress attire',late:'tardy tardiness',absent:'absence attendance',miss:'absence attendance',phone:'phone cell cellular technology',phones:'phone cell cellular technology',ai:'artificial intelligence academic integrity',homework:'assignments homework academic',cheat:'cheating plagiarism integrity',bully:'bullying harassment',grades:'grade grading gpa',clubs:'club activities',parking:'parking vehicle driving',sick:'illness absence attendance',lunch:'lunch food cafeteria',help:'support assistance',vape:'vaping tobacco smoking',hoodies:'hood sweatshirt dress'};
const words = s => s.toLowerCase().match(/[a-z0-9]+/g)||[];
const stem = s => s.length>4?s.replace(/(ing|es|s)$/,''):s;

export function createSearch(pages) {
  const chunks=[];
  let section='General information';
  for(const page of pages){
    if(page.page<6)continue;
    const marker=page.text.indexOf('Original handbook page');
    if(marker>=0)section=page.text.slice(0,marker).replace(/\s+/g,' ').trim();
    const clean=page.text.replace(/^.*?Original handbook page\s*/s,marker>=0?'':'$&').replace(/Oaks Christian School • High School Student Handbook — \d+ \/ 92/g,'').trim();
    const lines=clean.split('\n');
    for(let start=0;start<lines.length;start+=7){
      const text=lines.slice(start,start+11).join('\n').trim();
      if(text.length<65)continue;
      chunks.push({page:page.page,section,text,terms:new Set(words(text+' '+section).map(stem))});
    }
  }
  const frequencies=new Map();
  for(const chunk of chunks)for(const term of chunk.terms)frequencies.set(term,(frequencies.get(term)||0)+1);
  return function search(query,limit=3){
    const original=words(query).filter(w=>!stop.has(w));
    const expanded=new Set(original.flatMap(w=>[w,...(aliases[w]||'').split(' ')]).filter(Boolean).map(stem));
    if(!expanded.size)return [];
    const scored=chunks.map(c=>{
      let score=0,hits=0;
      for(const w of expanded)if(c.terms.has(w)){score+=Math.log(1+chunks.length/(1+frequencies.get(w)));hits++;}
      for(const w of original)if(words(c.section).map(stem).includes(stem(w)))score+=2;
      return {...c,score,hits};
    }).filter(c=>c.hits>=Math.min(2,expanded.size)&&c.score>2.8).sort((a,b)=>b.score-a.score);
    const results=[];
    for(const c of scored)if(!results.some(r=>r.page===c.page)){results.push({page:c.page,section:c.section,text:c.text});if(results.length===limit)break;}
    return results;
  };
}
