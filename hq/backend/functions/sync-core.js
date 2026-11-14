'use strict';
/** Pure data transformations for the HQ Google Sheets <-> Firestore bridge.
 * No credentials, data storage, or network side effects in this module.
 */
const crypto = require('node:crypto');
const TABLES = Object.freeze({
  missions:{tab:'Missions',key:'id',time:'updatedAt',columns:['id','title','domain','priority','due','dueKind','state','owner','outcome','nextAction','notes','source','url','followUp','stepsJSON','eventLogJSON','evidence','approval','taskMode','draft','createdAt','updatedAt'],write:['title','domain','priority','due','dueKind','state','outcome','nextAction','notes','followUp','evidence','approval','taskMode','updatedAt']},
  jobs:{tab:'HQ Jobs',key:'jobId',time:'lastUpdated',columns:['jobId','createdAt','project','request','mode','status','priority','organizer','lanesJSON','plan','resultSummary','resultLinksJSON','approvalState','lastUpdated','lastChecked','version','source'],write:['project','request','mode','status','priority','lastUpdated','source']},
  updates:{tab:'Project Updates',key:'updateId',time:'timestamp',columns:['timestamp','missionId','project','summary','completed','remaining','nextAction','blocker','evidenceUrl','source','verification','recordedBy','updateId'],write:['timestamp','missionId','project','summary','completed','remaining','nextAction','blocker','evidenceUrl','source','verification','recordedBy']}
});
function normalizeCell(value){if(value===null||value===undefined)return '';if(typeof value==='string')return value;return typeof value==='number'||typeof value==='boolean'?String(value):'';}
function toRows(values,key){if(!Array.isArray(values)||!values.length)return [];
 const heads=values[0].map(String);if(!heads.includes(key))throw Error('Missing sheet column '+key);
 const rows=[];for(const arr of values.slice(1)){if(!Array.isArray(arr))continue;const row={};heads.forEach((h,i)=>{if(h)row[h]=normalizeCell(arr[i])});if(/^[\w.\-]{1,120}$/.test(row[key]||''))rows.push(row)}return rows;
}
function fingerprint(object,fields){const pairs=fields.map(k=>[k,normalizeCell(object?.[k])]);return crypto.createHash('sha256').update(JSON.stringify(pairs)).digest('hex');}
function parseDateTime(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?ms:null;}
function chooseImport(type,sheet,cloud){
 if(!cloud)return 'new';
 const table=TABLES[type];if(!table)throw Error('Unknown type');
 if(type==='updates')return 'keep'; // Append-only journal; never rewrite phone notes.
 const sig=fingerprint(sheet,table.columns);
 if(cloud.sheetFingerprint===sig)return 'keep';
 const sheetTime=parseDateTime(sheet[table.time]),cloudTime=parseDateTime(cloud[table.time]);
 if(sheetTime===null||cloudTime===null)return 'conflict';
 return sheetTime>cloudTime?'sheet-newer': 'keep';
}
function makeSheetRow(type,record,current,headers){
 const table=TABLES[type];if(!table)throw Error('Invalid table');
 const cols=headers||table.columns;const row=current?Array.from(current):Array(cols.length).fill('');
 for(let i=0;i<cols.length;i++){
   const col=cols[i];if(!current&&record[col]!==undefined)row[i]=normalizeCell(record[col]);
   if(current&&table.write.includes(col)&&record[col]!==undefined)row[i]=normalizeCell(record[col]);
 }
 const keyIndex=cols.indexOf(table.key);if(keyIndex<0)throw Error('Invalid sheet schema');
 row[keyIndex]=normalizeCell(record[table.key]);
 if(type==='jobs'&&cols.includes('status')){
   const i=cols.indexOf('status');if(row[i]==='local_queued')row[i]='queued';
 }
 if(type==='updates'&&cols.includes('verification')&&record.source==='Personal note')row[cols.indexOf('verification')]='personal_note_unverified';
 return row;
}
function meaningfulChange(type,oldDoc,newDoc){
 if(!newDoc)return false; if(!oldDoc)return true;
 return fingerprint(oldDoc,TABLES[type].write)!==fingerprint(newDoc,TABLES[type].write);
}
function validSheetId(s){return /^[a-zA-Z0-9_-]{20,130}$/.test(String(s||''));}
function localHour(now,timezone='America/Toronto'){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
 return Number(parts.find(x=>x.type==='hour').value);
}
function localDate(now,timezone='America/Toronto'){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const a=Object.fromEntries(p.filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));return `${a.year}-${a.month}-${a.day}`;
}
function daysUntil(day,today){if(!/^\d{4}-\d\d-\d\d$/.test(day||''))return null;return Math.round((Date.parse(day+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);}
function riskScore(task,today){if(task.state==='done'||task.status==='done')return -Infinity;
 const n=daysUntil(task.due,today);const p=Math.min(10,Math.max(1,Number(task.priority)||5));
 return p*10+(n!==null?(n<0?32:n===0?30:n<=2?20:n<=7?10:0):0)+(task.state==='approval'||task.status==='awaiting_approval'?18:0);
}
function topThree(missions,today){return [...missions].filter(x=>x.state!=='done').sort((a,b)=>riskScore(b,today)-riskScore(a,today)).slice(0,3);}
module.exports={TABLES,toRows,fingerprint,chooseImport,makeSheetRow,meaningfulChange,validSheetId,localHour,localDate,daysUntil,riskScore,topThree,parseDateTime};