'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{boot}=require('./ui.test.cjs'),{ids}=require('./corpus.cjs');
test('Bubble Shooter uses readable labels with unchanged pointer/keyboard controls',()=>{
 const b=boot('bubble-shooter'),buttons=b.els.controls.children;
 assert.deepEqual(buttons.map(x=>x.textContent),['左轉','發射','右轉']);
 assert.deepEqual(buttons.map(x=>x.attributes['aria-label']),['左轉','發射','右轉']);
 assert.deepEqual(buttons.map(x=>x.dataset.control),['left','fire','right']);
 for(const [index,key]of [[0,'left'],[2,'right']]){
  const button=buttons[index];button.dispatch('pointerdown');assert.equal(b.context.ActionApp.input()[key],true);
  button.dispatch('pointercancel');assert.equal(b.context.ActionApp.input()[key],undefined);
  button.dispatch('keydown',{key:'Enter'});assert.equal(b.context.ActionApp.input()[key],true);
  button.dispatch('keyup',{key:'Enter'});assert.equal(b.context.ActionApp.input()[key],undefined);
 }
 buttons[1].dispatch('pointerdown');assert.equal(b.context.ActionApp.input().fire,true);assert.equal(b.context.ActionApp.input().fire,undefined);buttons[1].dispatch('pointerup');
});
test('All other action games retain their exact declared visible and accessible labels',()=>{
 for(const id of ids.filter(id=>id!=='bubble-shooter')){
  const b=boot(id),game=b.context.ActionApp.game,buttons=b.els.controls.children;
  assert.deepEqual(buttons.map(x=>x.textContent),Array.from(game.buttons,x=>x[1]),id);
  assert.deepEqual(buttons.map(x=>x.attributes['aria-label']),Array.from(game.buttons,x=>x[1]),id);
 }
});
