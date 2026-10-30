import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createSearch} from '../dist/handbook-search.js';
const search=createSearch(JSON.parse(await readFile(new URL('../dist/assets/handbook.json',import.meta.url))));
for(const [question,min,max] of [['What is the dress code?',56,58],['What happens if I am late to class?',59,66],['Can I use AI for homework?',36,39],['How are grades calculated?',30,35]]){
 const results=search(question);console.log(question,results.map(r=>r.page));assert(results.some(r=>r.page>=min&&r.page<=max));
}
assert.equal(search('quantum spaceship dinosaur recipes').length,0);
console.log('Search checks passed.');
