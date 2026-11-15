'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'goal-loop.js'), 'utf8');
const context = {};
vm.runInNewContext(src, context, {timeout:1000});
const loop = context.HQ_GOAL_LOOP;
const at = '2026-11-14T18:00:00.000Z';
const mission = Object.freeze({id:'M-1',title:'Research seminar',state:'review',priority:9,nextAction:'Verify the latest deck'});
const job = loop.makeSession(mission,'guide',at,'FOCUS-QA-1');
test('Source is a user bookmark, not a running agent', () => {
 assert.equal(job.source, 'hq-focus-v1');
 assert.equal(job.organizer,'user_focus');
 assert.match(job.request,/Not an automatically executing/);
});
test('Creates work in existing HQ Jobs sheet schema', () => {
 for (const key of ['jobId','createdAt','project','request','mode','status','priority','organizer','lanesJSON','plan','resultSummary','resultLinksJSON','approvalState','lastUpdated','lastChecked','version','source'])
   assert.ok(Object.hasOwn(job,key),key);
});
test('Does not change original mission or falsely complete it',()=> {
 assert.equal(mission.state,'review');assert.equal(job.status,'focus_active');
 assert.equal(mission.lastUpdated,undefined);
});
test('Guard against blank/invalid missions',()=>{
 assert.throws(()=>loop.makeSession(null,'execute',at));
 assert.throws(()=>loop.makeSession({id:'',title:'x'},'execute',at));
});
test('Supports Guide Me and Do It For Me mode',()=>{
 assert.equal(job.mode,'guide');
 assert.equal(loop.makeSession(mission,'execute',at,'FOCUS-2').mode,'execute');
});
test('Identifies latest open focus and ignores unrelated jobs',()=>{
 const j2=loop.makeSession(mission,'execute','2026-11-14T19:00:00Z','FOCUS-QA-2');
 assert.equal(loop.activeSession([job,{jobId:'old',status:'queued',source:'app'},j2]).jobId,'FOCUS-QA-2');
});
test('Persists a paused checkpoint for a cross-device resume',()=>{
 const p=loop.transition(job,'focus_paused','2026-11-14T18:05:00Z','Paused before slide 8');
 assert.equal(loop.forMission([p],'M-1').resultSummary,'Paused before slide 8');
 assert.equal(loop.transition(p,'focus_active','2026-11-14T19:00:00Z').resultSummary,p.resultSummary);
});
test('Review is not equivalent to completed mission',()=>{
 const p=loop.transition(job,'focus_review','2026-11-14T18:20:00Z','Prepared three slide outlines');
 assert.equal(p.status,'focus_review'); assert.equal(mission.state,'review');
 assert.equal(loop.activeSession([p]),null);
});
test('A review requires one actual note',()=> {
 assert.throws(()=>loop.transition(job,'focus_review',at,''));
});
test('Existing notes survive status-only updates',()=> {
 const before=loop.transition(job,'focus_paused',at,'Keep the saved note');
 assert.equal(loop.transition(before,'focus_active','2026-11-14T19:10:00Z','').resultSummary,'Keep the saved note');
});
test('Rejects bogus states or unrecognized records',()=>{
 assert.throws(()=>loop.transition(job,'done',at,'x'));
 assert.throws(()=>loop.transition({jobId:'J-1'},'focus_paused',at,'x'));
});
test('Does not make normal user jobs vanish',()=>{
 const other={jobId:'LOCAL-1',source:'phone',status:'queued'};
 assert.equal(loop.visibleQueue([other,job])[0],other);
 assert.equal(loop.visibleQueue([other,job]).length,1);
});
test('Keeps old mission details when making a session',()=>{
 assert.equal(job.plan,'Verify the latest deck');assert.equal(job.missionId,'M-1');
});
test('Marks review-state or missing-next-step missions as requiring verification',()=>{
 assert.equal(loop.needsVerification(mission),true);
 assert.equal(loop.needsVerification({...mission,state:'ready'}),false);
 assert.equal(loop.needsVerification({...mission,state:'ready',nextAction:''}),true);
});
test('Handles empty, malformed or missing queue without crash',()=>{
 assert.equal(loop.openSessions(null).length,0);
 assert.equal(loop.activeSession([]),null);
 assert.equal(loop.forMission([{status:'focus_active'}],'M-1'),null);
});
test('Does not modify unrelated fields in a paused bookmark',()=>{
 const extension={...job,customFutureField:'kept',syncedAt:'2026-11-14'};
 const updated=loop.transition(extension,'focus_paused','2026-11-14T20:00:00Z');
 assert.equal(updated.customFutureField,'kept');
 assert.equal(updated.syncedAt,'2026-11-14');
});
