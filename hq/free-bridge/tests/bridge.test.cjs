const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');

const HEADS={
 missions:['id','title','domain','priority','due','dueKind','state','owner','outcome','nextAction','notes','source','url','followUp','stepsJSON','eventLogJSON','evidence','approval','taskMode','draft','createdAt','updatedAt'],
 jobs:['jobId','createdAt','project','request','mode','status','priority','organizer','lanesJSON','plan','resultSummary','resultLinksJSON','approvalState','lastUpdated','lastChecked','version','source'],
 updates:['timestamp','missionId','project','summary','completed','remaining','nextAction','blocker','evidenceUrl','source','verification','recordedBy','updateId']
};
const names={missions:'Missions',jobs:'HQ Jobs',updates:'Project Updates'};
function row(type,obj){return HEADS[type].map(x=>obj[x]??'')}
function castDoc(data,id){const fields={};for(const [k,v] of Object.entries(data))fields[k]=typeof v==='boolean'?{booleanValue:v}:{stringValue:String(v)};
return {name:'projects/p/databases/(default)/documents/users/uid/'+(id||'') ,fields,updateTime:'2026-11-14T21:00:00Z'};}
function fixture({missions=[],jobs=[],updates=[],cloudM=[],cloudJ=[],cloudU=[],props={}}={}){
 const sheets={};for(const type of Object.keys(HEADS))sheets[names[type]]=[HEADS[type],...({missions,jobs,updates}[type].map(x=>row(type,x)))];
 const cloud={missions:new Map(),jobs:new Map(),updates:new Map(),syncMeta:new Map()};
 [[cloudM,'missions','id'],[cloudJ,'jobs','jobId'],[cloudU,'updates','updateId']].forEach(([arr,k,id])=>arr.forEach(x=>cloud[k].set(x[id],{...x})));
 const calls=[],emails=[],configs={FIREBASE_UID:'testfirebaseUID1234567890',HQ_EMAIL_REMINDERS:'false',...props};
 function tab(name){const matrix=sheets[name];return {getDataRange(){return {getDisplayValues(){return matrix.map(r=>r.map(String))}}}, getRange(i,j,rows,cols){return {setValues(list){for(let y=0;y<rows;y++)matrix[i+y-1]=list[y]}}}, appendRow(r){matrix.push(r.map(String))},getLastRow(){return matrix.length}};}
 const PropertiesService={getScriptProperties(){return {getProperty:k=>configs[k]??null,setProperty:(k,v)=>{configs[k]=String(v)},deleteProperty:k=>delete configs[k]}}};
 const http={getResponseCode(){return this.status},getContentText(){return JSON.stringify(this.response)}};
 const UrlFetchApp={fetch(url,opts){calls.push({url,opts});if(!opts)opts={method:'get'};let path=url.split('/documents/users/')[1];const bits=path.split('?')[0].split('/');const kind=bits[1],id=bits[2];if(opts.method==='get'){if(!id){let docs=[...cloud[kind].entries()].map(([key,x])=>{const d=castDoc(x,'users/test/'+kind+'/'+key);d.name='projects/p/databases/(default)/documents/users/test/'+kind+'/'+key;return d});return {...http,status:200,response:{documents:docs}}}return {...http,status:cloud[kind].has(id)?200:404,response:{}}}if(opts.method==='patch'){const d=JSON.parse(opts.payload);let ob={...cloud[kind].get(id)};for(const [k,v] of Object.entries(d.fields||{}))ob[k]=Object.hasOwn(v,'booleanValue')?v.booleanValue:String(v.stringValue||'');cloud[kind].set(id,ob);return {...http,status:200,response:{name:'record'}}}throw Error('unhandled '+url)}};
 const ctx={console:{log(){},error(){}},PropertiesService,SpreadsheetApp:{getActiveSpreadsheet(){return {getName(){return 'Private HQ'},getSheetByName:tab}}},UrlFetchApp,
 ScriptApp:{getOAuthToken(){return 'test-oauth'},getProjectTriggers(){return []},newTrigger(){return {timeBased(){return this},everyMinutes(){return this},create(){}}}},
 LockService:{getScriptLock(){return {tryLock(){return true},releaseLock(){}}}},
 Utilities:{formatDate(_,tz,pattern){return {'yyyy-MM-dd':'2026-11-14','H':'8'}[pattern]||''}},
 MailApp:{getRemainingDailyQuota(){return 100},sendEmail:x=>emails.push(x)},
 Date,Number,Math,Object,JSON,String,Array,RegExp,encodeURIComponent};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {ctx,cloud,sheets,calls,emails,props:configs};
}
const mission=(o={})=>({id:'IMM-01',title:'PR documents',domain:'Immigration',priority:'9',due:'2026-11-20',state:'ready',nextAction:'Review checklist',createdAt:'2026-11-10T10:00:00Z',updatedAt:'2026-11-12T10:00:00Z',...o});
const update=(o={})=>({timestamp:'2026-11-14T15:00:00Z',project:'Adarsh HQ',summary:'Progress verified',verification:'verified',updateId:'HQ-001',...o});
const job=(o={})=>({jobId:'LOCAL-J001',createdAt:'2026-11-14T15:05:00Z',project:'CNS',request:'Review my talk',status:'queued',priority:'8',lastUpdated:'2026-11-14T15:06:00Z',...o});
test('Apps Script compiles in V8 compatible JS',()=>assert.doesNotThrow(()=>new vm.Script(code)));
test('private Google Sheet mission imports to Firebase',()=>{const x=fixture({missions:[mission()]});x.ctx.hqTick();assert.equal(x.cloud.missions.get('IMM-01').title,'PR documents');assert.equal(x.cloud.missions.get('IMM-01').syncOrigin,'sheet')});
test('new phone job mirrors into exact HQ Jobs tab',()=>{const x=fixture({cloudJ:[{...job(),syncOrigin:'phone'}]});x.ctx.hqTick();assert.equal(x.sheets['HQ Jobs'].length,2);assert.equal(x.sheets['HQ Jobs'][1][0],'LOCAL-J001')});
test('new phone progress note mirrors into Project Updates',()=>{const x=fixture({cloudU:[{...update({updateId:'LOCAL-100',source:'Personal note',verification:'personal_note_unverified'}),syncOrigin:'phone'}]});x.ctx.hqTick();assert.equal(x.sheets['Project Updates'][1][12],'LOCAL-100')});
test('phone newer mission updates sheet without deleting preserved columns',()=>{const a=mission(),b=mission({updatedAt:'2026-11-14T16:00:00Z',nextAction:'Submit application',syncOrigin:'phone'});const x=fixture({missions:[a],cloudM:[b]});x.ctx.hqTick();assert.equal(x.sheets.Missions[1][9],'Submit application');assert.equal(x.sheets.Missions[1][0],'IMM-01')});
test('Google Sheet newer mission updates phone',()=>{const a=mission({updatedAt:'2026-11-14T16:00:00Z',nextAction:'Submit application'}),b=mission({updatedAt:'2026-11-12T10:00:00Z',nextAction:'Old',syncOrigin:'phone'});const x=fixture({missions:[a],cloudM:[b]});x.ctx.hqTick();assert.equal(x.cloud.missions.get('IMM-01').nextAction,'Submit application')});
test('tied timestamps with differing content do not overwrite',()=>{const a=mission(),b=mission({nextAction:'Phone work',syncOrigin:'phone'});const x=fixture({missions:[a],cloudM:[b]});const out=x.ctx.hqTick();assert.equal(out.missions.conflicts,1);assert.equal(x.sheets.Missions[1][9],'Review checklist');assert.equal(x.cloud.missions.get('IMM-01').nextAction,'Phone work')});
test('verified journal is append-only if differing',()=>{const a=update(),b=update({summary:'Other',syncOrigin:'phone'});const x=fixture({updates:[a],cloudU:[b]});const out=x.ctx.hqTick();assert.equal(out.updates.conflicts,1);assert.equal(x.cloud.updates.get('HQ-001').summary,'Other');assert.equal(x.sheets['Project Updates'][1][3],'Progress verified')});
test('same content does not cause write churn',()=>{const a=mission();const x=fixture({missions:[a],cloudM:[a]});const out=x.ctx.hqTick();assert.equal(out.missions.unchanged,1);assert.equal(x.calls.filter(c=>c.opts?.method==='patch'&&!c.url.includes('/syncMeta/')).length,0)});
test('no notification when not opted in',()=>{const x=fixture({missions:[mission()]});x.ctx.hqTick();assert.equal(x.emails.length,0)});
test('opted-in email is single 1-action message and de-duplicated',()=>{const x=fixture({missions:[mission()],props:{HQ_EMAIL_REMINDERS:'true',HQ_SELF_EMAIL:'example@gmail.com'}});x.ctx.hqTick();x.ctx.hqTick();assert.equal(x.emails.length,1);assert.match(x.emails[0].body,/Choose ONE meaningful action/)});
test('never writes credential into content or a public file',()=>{assert.ok(!code.includes('-----BEGIN PRIVATE KEY-----'));assert.ok(!code.includes('AIza'));assert.ok(!/SPREADSHEET_ID\s*=/.test(code))});
test('invalid Firebase UID is rejected',()=>{const x=fixture({props:{FIREBASE_UID:'wrong'}});assert.throws(()=>x.ctx.hqCheckConnection(),/FIREBASE_UID/)});
test('formula-like phone content is escaped',()=>{const x=fixture({cloudJ:[{...job({request:'=IMPORTRANGE("bad","A1")'}),syncOrigin:'phone'}]});x.ctx.hqTick();assert.ok(x.sheets['HQ Jobs'][1][3].startsWith("'="))});

test('successful run writes private sync health for Android',()=>{const x=fixture({missions:[mission()]});x.ctx.hqTick();assert.equal(x.cloud.syncMeta.get('current').lastSyncStatus,'ok');assert.equal(x.cloud.syncMeta.get('current').syncEngine,'apps-script-free')});