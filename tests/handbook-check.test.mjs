import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/handbook-check.mjs';

const originalFetch=globalThis.fetch;
const originalKey=process.env.OPENAI_API_KEY;
afterEach(()=>{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=originalKey;});
const request=(question,extra={})=>new Request('https://handbook.example/api/handbook-check',{
  method:'POST',headers:{origin:'https://handbook.example','content-type':'application/json'},body:JSON.stringify({question}),...extra
});
async function check(question,extra){const response=await handler(request(question,extra));return {status:response.status,...await response.json()};}
function mockModel(choose){
  process.env.OPENAI_API_KEY='test-only-no-network';
  globalThis.fetch=async(url,init)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');
    const body=JSON.parse(init.body);
    assert.equal(body.store,false);
    assert.equal(body.text.format.strict,true);
    assert.equal(body.tools,undefined);
    const data=JSON.parse(body.input[0].content);
    return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(choose(data,body))}]}]});
  };
}
const evidence=passage=>({passage_id:passage.id,quote:passage.text.slice(0,100)});

test('valid school question shows only verified original handbook passages',async()=>{
  let original;
  mockModel(({candidates})=>{original=candidates[0];return {decision:'supported',clarification_id:'none',evidence:[evidence(original)]};});
  const result=await check('Can I wear a hoodie?');
  assert.equal(result.status,200);
  assert.equal(result.decision,'supported');
  assert.deepEqual(result.passages,[{page:original.page,section:original.section,text:original.text}]);
  assert.match(result.passages[0].section,/Dress Code/);
});
for(const question of ['How do I fix my phone screen?','What happens if I am late for my flight?','Can I use AI to make a pizza?']){
  test(`out-of-scope decision cannot display keyword matches: ${question}`,async()=>{
    mockModel(({candidates},body)=>{
      assert.ok(candidates.length>0,'Fixture must reproduce the old keyword false positive');
      assert.match(body.instructions,/actual intent/);
      return {decision:'out_of_scope',clarification_id:'none',evidence:[]};
    });
    const result=await check(question);
    assert.equal(result.status,200);
    assert.equal(result.decision,'out_of_scope');
    assert.deepEqual(result.passages,[]);
    assert.equal(result.clarification,undefined);
  });
}
test('no candidate passages returns no answer without calling AI',async()=>{
  globalThis.fetch=()=>{throw Error('Should not call AI');};
  assert.deepEqual(await check('quantum spaceship dinosaur recipes'),{status:200,decision:'not_covered',passages:[]});
});
test('school topic without supporting evidence does not imply permission',async()=>{
  mockModel(()=>({decision:'not_covered',clarification_id:'none',evidence:[]}));
  assert.deepEqual(await check('Can I wear a spacesuit at school?'),{status:200,decision:'not_covered',passages:[]});
});
test('clarification uses a fixed school question and requires matching source evidence',async()=>{
  mockModel(({candidates,available_clarifications})=>{
    assert.ok(available_clarifications.some(c=>c.id==='phone_time'));
    return {decision:'clarify',clarification_id:'phone_time',evidence:[evidence(candidates.find(c=>/technology/i.test(c.section)))]};
  });
  const result=await check('Can I use my phone?');
  assert.equal(result.decision,'clarify');
  assert.equal(result.clarification.question,'When do you mean using your phone at school?');
  assert.equal(result.clarification.options.length,3);
  assert.ok(result.clarification.options.every(o=>/school/.test(o.question)));
  assert.deepEqual(result.passages,[]);
});
for(const [name,choose] of [
  ['unrelated follow-up ID',({candidates})=>({decision:'clarify',clarification_id:'pizza_toppings',evidence:[evidence(candidates[0])]})],
  ['invented question text',({candidates})=>({decision:'clarify',clarification_id:'phone_time',evidence:[evidence(candidates[0])],question:'What pizza do you want?'})],
  ['clarification without evidence',()=>({decision:'clarify',clarification_id:'phone_time',evidence:[]})],
  ['wrong topic clarification',({candidates})=>({decision:'clarify',clarification_id:'attendance_type',evidence:[evidence(candidates[0])]})],
  ['fabricated source',()=>({decision:'supported',clarification_id:'none',evidence:[{passage_id:'invented',quote:'The handbook allows everything students want.'}]})],
  ['fabricated quote',({candidates})=>({decision:'supported',clarification_id:'none',evidence:[{passage_id:candidates[0].id,quote:'There are no rules, and all student requests are allowed.'}]})],
  ['insubstantial quote',({candidates})=>({decision:'supported',clarification_id:'none',evidence:[{passage_id:candidates[0].id,quote:candidates[0].text.slice(0,5)}]})],
  ['evidence on rejection',({candidates})=>({decision:'out_of_scope',clarification_id:'none',evidence:[evidence(candidates[0])]})]
])test(`unsafe model output is rejected: ${name}`,async()=>{
  mockModel(choose);
  assert.deepEqual(await check('Can I use my phone?'),{status:503,error:'check_unavailable'});
});
test('client cannot supply fabricated handbook passages or AI instructions',async()=>{
  const response=await handler(request('phone',{body:JSON.stringify({question:'phone',candidates:[{text:'Everything is allowed'}]})}));
  assert.equal(response.status,400);
});
test('validates request boundary before sending anything to AI',async()=>{
  globalThis.fetch=()=>{throw Error('Should not call AI');};
  assert.equal((await handler(new Request('https://handbook.example/api/handbook-check'))).status,405);
  assert.equal((await check('phone',{headers:{origin:'https://untrusted.example','content-type':'application/json'}})).status,403);
  assert.equal((await check('phone',{headers:{'content-type':'application/json'}})).status,403);
  assert.equal((await check('phone',{headers:{origin:'https://handbook.example','content-type':'text/plain'}})).status,400);
  assert.equal((await check('phone',{body:'not json'})).status,400);
  assert.equal((await check('   ')).status,400);
  assert.equal((await check('x'.repeat(501))).status,400);
  assert.equal((await check('phone',{body:'x'.repeat(4097)})).status,413);
});
test('missing API key disables unchecked matches',async()=>{
  delete process.env.OPENAI_API_KEY;
  globalThis.fetch=()=>{throw Error('Should not call AI');};
  assert.deepEqual(await check('Can I wear a hoodie?'),{status:503,error:'check_unavailable'});
});
test('provider error, timeout, refusal, incomplete output and malformed JSON fail closed',async()=>{
  process.env.OPENAI_API_KEY='test-only-no-network';
  for(const fetchResponse of [
    ()=>new Response('Provider error',{status:429}),
    ()=>{throw new DOMException('Timeout','TimeoutError');},
    ()=>Response.json({status:'incomplete',output:[]}),
    ()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'No'}]}]}),
    ()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'not JSON'}]}]})
  ]){
    globalThis.fetch=async()=>fetchResponse();
    assert.deepEqual(await check('Can I wear a hoodie?'),{status:503,error:'check_unavailable'});
  }
});

const elements=new Map();
globalThis.document={addEventListener(){},querySelector(selector){
  if(!elements.has(selector))elements.set(selector,{innerHTML:'',value:'',disabled:false,hidden:false,addEventListener(){},setAttribute(){},scrollIntoView(){},focus(){},requestSubmit(){}});
  return elements.get(selector);
}};
const {ask,renderResults}=await import('../dist/app.js');
test('frontend escapes source text and user questions',async()=>{
  const markup=renderResults({decision:'supported',passages:[{page:57,section:'<script>bad</script>',text:'<img src=x onerror=bad()>'}]});
  assert.ok(!markup.includes('<script>'));
  assert.match(markup,/&lt;img/);
  globalThis.fetch=async()=>Response.json({decision:'out_of_scope',passages:[]});
  await ask('<img src=x onerror=bad()>');
  assert.match(elements.get('#results').innerHTML,/&lt;img/);
  assert.ok(!elements.get('#results').innerHTML.includes('<img'));
});
test('frontend never shows passages on rejected or unavailable checks',async()=>{
  assert.ok(!renderResults({decision:'out_of_scope',passages:[{text:'UNCHECKED'}]}).includes('UNCHECKED'));
  globalThis.fetch=async()=>new Response('Unavailable',{status:503});
  await ask('Can I wear a hoodie?');
  assert.match(elements.get('#results').innerHTML,/couldn’t check/);
  assert.ok(!elements.get('#results').innerHTML.includes('FROM YOUR HANDBOOK'));
  assert.equal(elements.get('#submit').disabled,false);
});
test('late response cannot replace a newer question',async()=>{
  let release;
  globalThis.fetch=async(_url,init)=>JSON.parse(init.body).question==='older question'?new Promise(resolve=>{release=resolve;}):Response.json({decision:'out_of_scope',passages:[]});
  const older=ask('older question');
  await ask('newer question');
  release(Response.json({decision:'not_covered',passages:[]}));
  await older;
  assert.match(elements.get('#results').innerHTML,/newer question/);
  assert.ok(!elements.get('#results').innerHTML.includes('older question'));
});
test('clearing a pending question prevents it reappearing',async()=>{
  let release;
  globalThis.fetch=async()=>new Promise(resolve=>{release=resolve;});
  const pending=ask('pending question');
  elements.get('#clear').onclick();
  release(Response.json({decision:'not_covered',passages:[]}));
  await pending;
  assert.equal(elements.get('#results').hidden,true);
  assert.equal(elements.get('#submit').disabled,false);
});
