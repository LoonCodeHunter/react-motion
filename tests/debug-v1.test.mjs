import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDebugSession,debug} from '../dist/es/debug.js';

test('opt-in debug sessions bound memory and report only after enable',()=>{
  const session=createDebugSession({maxRecords:2,now:()=>123});
  let count=0;const unsubscribe=session.subscribe(()=>count++);
  session.log('render','not recorded');
  assert.equal(session.records().length,0);
  session.enable();session.log('render','begin',{duration:100});session.log('render','middle');session.log('drag','end');
  assert.equal(count,3);assert.deepEqual(session.records().map(r=>r.message),['middle','end']);
  assert.deepEqual(session.records('drag').map(r=>r.time),[123]);
  unsubscribe();session.disable();session.log('render','hidden');assert.equal(session.records().length,2);
  session.clear();assert.equal(session.records().length,0);assert.equal(debug.enabled,false);
});
test('debug sessions reject unsafe capacity and do not let listener throws affect callers',()=>{
  assert.throws(()=>createDebugSession({maxRecords:0}),/maxRecords/);
  const session=createDebugSession();session.enable();session.subscribe(()=>{throw new Error('subscriber failed')});
  assert.doesNotThrow(()=>session.log('scope','message'));
  assert.equal(session.records().length,1);
});
