'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const c=require('../sync-core');
test('Sheet parser preserves IDs, leading zero data and avoids invented cells',()=>{
 const x=c.toRows([['id','priority','due'],['IMM-01',10,'2026-12-31'],['RES-06','09',''],['','4',''],null],'id');
 assert.equal(x.length,2);assert.equal(x[1].priority,'09');assert.equal(x[1].due,'');
});
test('Sheet cannot override a newer phone task',()=>{
 const sheet={id:'RES-06',title:'Older',updatedAt:'2026-11-14T15:00:00-05:00'};
 const phone={id:'RES-06',title:'Newer',updatedAt:'2026-11-14T15:40:00-05:00'};
 assert.equal(c.chooseImport('missions',sheet,phone),'keep');
 assert.equal(c.chooseImport('missions',{...sheet,updatedAt:'2026-11-14T16:00:00-05:00'},phone),'sheet-newer');
});
test('Journal entries are append-only',()=>{
 assert.equal(c.chooseImport('updates',{updateId:'abc',summary:'changed'},{updateId:'abc',summary:'original'}),'keep');
 assert.equal(c.chooseImport('updates',{updateId:'abc'},{lastUpdated:'any'}),'keep');
});
test('Unknown timestamps are flagged as conflicts',()=>{
 assert.equal(c.chooseImport('jobs',{jobId:'J1'},{jobId:'J1'}),'conflict');
});
test('Phone mission write preserves all other Sheet columns',()=>{
 const headers=c.TABLES.missions.columns;
 const old=headers.map(k=>({id:'IMM-01',notes:'Original note',source:'IRCC portal',url:'https://example.net'}[k]||''));
 const row=c.makeSheetRow('missions',{id:'IMM-01',title:'Updated',state:'active',nextAction:'Send form',updatedAt:'2026-11-14T20:00:00Z'},old,headers);
 assert.equal(row[headers.indexOf('source')],'IRCC portal');assert.equal(row[headers.indexOf('url')],'https://example.net');assert.equal(row[headers.indexOf('notes')],'Original note');assert.equal(row[headers.indexOf('title')],'Updated');
});
test('Phone jobs map queued status and dates',()=>{
 const header=c.TABLES.jobs.columns;
 const row=c.makeSheetRow('jobs',{jobId:'LOCAL-123',request:'Finish presentation',status:'local_queued',lastUpdated:'2026-11-14T20:00:00Z'},null,header);
 assert.equal(row[header.indexOf('status')],'queued');assert.equal(row[header.indexOf('request')],'Finish presentation');
});
test('Personal note never gets fabricated verified status',()=>{
 const h=c.TABLES.updates.columns;const row=c.makeSheetRow('updates',{updateId:'A',summary:'Note',verification:'verified',source:'Personal note'},null,h);
 assert.equal(row[h.indexOf('verification')],'personal_note_unverified');
});
test('No-op cloud changes do not re-mirror',()=>{
 assert.equal(c.meaningfulChange('jobs',{jobId:'A',status:'queued',syncedAt:'old'},{jobId:'A',status:'queued',syncedAt:'new'}),false);
 assert.equal(c.meaningfulChange('jobs',{status:'queued'},{status:'done'}),true);
});
test('Local dates and priority respect the Toronto timezone',()=>{
 assert.equal(c.localDate(new Date('2026-11-14T03:00:00Z')),'2026-11-13');
 assert.equal(c.daysUntil('2026-11-25','2026-11-14'),11);
 const tasks=[{id:'M',priority:6,state:'ready'},{id:'A',priority:9,state:'ready'},{id:'B',priority:10,state:'done'}];
 assert.deepEqual(c.topThree(tasks,'2026-11-14').map(x=>x.id),['A','M']);
});
test('Sheet IDs are format validated',()=>{
 assert.ok(c.validSheetId('SAMPLE_SHEET_ID_0123456789_ABCDEFGHIJ'));
 assert.ok(!c.validSheetId('https://evil.test/'));
});