import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const fake={addEventListener(){},innerHTML:'',onclick:null};
globalThis.document={querySelector:()=>fake,addEventListener(){}};
globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(await readFile(new URL('../dist/assets/handbook.json',import.meta.url)))});
const {ready,search}=await import('../dist/app.js');await ready;
for(const [question,min,max] of [['What is the dress code?',56,58],['What happens if I am late to class?',59,66],['Can I use AI for homework?',36,39],['How are grades calculated?',30,35]]){
 const results=search(question);console.log(question,results.map(r=>r.page));assert(results.some(r=>r.page>=min&&r.page<=max));
}
assert.equal(search('quantum spaceship dinosaur recipes').length,0);
console.log('Search checks passed.');
