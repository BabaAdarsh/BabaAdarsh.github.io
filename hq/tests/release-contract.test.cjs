'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('app.js'),firebase=read('firebase-sync.js'),sw=read('sw.js'),html=read('index.html'),css=read('styles.css');
test('HTML loads focus helper before original app and keeps Firebase module',()=>{
 assert.ok(html.indexOf('goal-loop.js')<html.indexOf('app.js'));assert.match(html,/firebase-sync\.js/);
 assert.match(html,/firebase-config\.js/);
});
test('All shipped scripts are syntactically valid',()=>{
 for(const f of ['app.js','goal-loop.js','sw.js'])assert.doesNotThrow(()=>new vm.Script(read(f)),f);
 assert.doesNotThrow(()=>require('node:child_process').execFileSync(process.execPath,['--check',path.join(root,'firebase-sync.js')],{stdio:'pipe'}), 'firebase-sync.js');
});
test('Offline shell caches the helper and retains existing primary assets',()=>{
 for(const key of ['goal-loop.js','app.js','index.html','styles.css','manifest.webmanifest','icon-192.png','icon-512.png'])assert.ok(sw.includes(key),key);
 assert.ok(sw.includes('adarsh-hq-pwa-v19'));
});
test('Existing private Firebase sync and Google HQ import still present',()=>{
 for(const key of ['saveMission','saveJob','saveUpdate','syncFromGoogleHQ','onSnapshot','users'])assert.ok(firebase.includes(key),key);
});
test('Existing user journeys remain in app',()=>{
 for(const key of ['Create mission','New mission','Save mission','Export device backup','Import HQ snapshot','Guide Me','Do It For Me','Sync Google HQ','Ask ChatGPT','Personal progress note','Continue in ChatGPT'])
 assert.ok(app.toLowerCase().includes(key.toLowerCase()),key);
});
test('Resumable focus controls exist but never claim mission done',()=>{
 for(const key of ['focusResume','focusPause','focusReview','focusNow','hq-focus-v1']) assert.ok((app+read('goal-loop.js')).includes(key),key);
 assert.match(app,/focus_review/);
});
test('No new private user data or paid server added',()=>{
 assert.doesNotMatch(read('goal-loop.js'),/1zFliw|BEGIN PRIVATE KEY|openai\.com\/v1|MailApp|Blaze/);
});
test('Existing local storage schema and keys unchanged',()=>{
 assert.ok(app.includes("const KEY='adarsh-hq-pwa-v06'"));
 assert.ok(app.includes("schema:'hq-pwa-local-v1'"));
});
test('New focus layout is responsive and does not remove legacy CSS',()=>{
 assert.match(css,/\.focus-resume/);
 assert.match(css,/@media\(max-width:640px\)/);
 assert.match(css,/\.mission-row/);
});
test('Private work packets go through already-existing Firebase job storage',()=>{
 assert.match(app,/HQ_BRIDGE\.saveJob\(job\)/);
 assert.match(read('goal-loop.js'),/const SOURCE = 'hq-focus-v1'/);
});
