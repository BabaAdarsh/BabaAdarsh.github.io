/* Adarsh HQ — optional trusted Firebase backend, v1.0.
 * ChatGPT remains the only assistant. This worker transports RECORDS and
 * generic notifications; it does not call an LLM or impersonate ChatGPT.
 *
 * NEVER deploy with Firestore public-read rules or a service account key.
 * Deploy Functions only after selecting/approving Firebase Blaze billing.
 */
'use strict';
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onDocumentWritten,onDocumentUpdated,onDocumentCreated}=require('firebase-functions/v2/firestore');
const logger=require('firebase-functions/logger');
const {GoogleAuth}=require('google-auth-library');
const {google}=require('googleapis');
const admin=require('firebase-admin');
const core=require('./sync-core');
admin.initializeApp();
const db=admin.firestore(),FieldValue=admin.firestore.FieldValue;
const REGION='northamerica-northeast1',TZ='America/Toronto';
const WEB='https://babaadarsh.github.io/hq/';
const CONFIG_DOC='hqOwners';
let clientPromise=null;
function wrappedError(error){return {code:error?.code||'unknown',message:String(error?.message||error||'unknown').slice(0,220)}}
async function owner(uid){const doc=await db.doc(`${CONFIG_DOC}/${uid}`).get();return doc.exists?doc.data():null;}
async function assertOwner(req){if(!req.auth?.uid)throw new HttpsError('unauthenticated','Sign in to HQ with Google first.');const config=await owner(req.auth.uid);if(!config)throw new HttpsError('permission-denied','This account is not authorized in HQ.');return {uid:req.auth.uid,config};}
async function sheetsClient(){if(!clientPromise){clientPromise=(async()=>{const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/spreadsheets']});const client=await auth.getClient();return {api:google.sheets({version:'v4',auth:client}),auth};})()}return clientPromise;}
async function serviceEmail(){const {auth}=await sheetsClient();const c=await auth.getCredentials();return c.client_email||null;}
async function googleValues(sheetId,tab,limit=2000){const {api}=await sheetsClient();const spec=core.TABLES[tab];const title=spec.tab.includes(' ')?`'${spec.tab}'`:spec.tab;
 const end=spec.columns.length<=13?'M':spec.columns.length<=17?'Q':'V';
 const result=await api.spreadsheets.values.get({spreadsheetId:sheetId,range:`${title}!A1:${end}${limit}`,valueRenderOption:'FORMATTED_VALUE'});
 return result.data.values||[];
}
async function setSyncMeta(uid,patch){await db.doc(`users/${uid}/syncMeta/current`).set({...patch,checkedAt:FieldValue.serverTimestamp()},{merge:true});}
async function logIssue(uid,type,id,reason){const key=`${type}-${String(id).slice(0,120)}`;await db.doc(`users/${uid}/syncIssues/${key}`).set({type,itemId:id,reason,updatedAt:FieldValue.serverTimestamp()},{merge:true});}
async function pullSheet(uid,config){
 if(!config?.sheetId||!core.validSheetId(config.sheetId))throw Error('HQ owner sheet ID is missing or invalid');
 const pulled={};for(const name of ['missions','jobs','updates']){
  const table=core.TABLES[name],raw=await googleValues(config.sheetId,name);
  const records=core.toRows(raw,table.key),collection=db.collection(`users/${uid}/${name}`);
  const pending=[];let unchanged=0,conflicts=0;
  for(const record of records){
    const doc=await collection.doc(record[table.key]).get();const existing=doc.exists?doc.data():null;
    const decision=core.chooseImport(name,record,existing);
    if(decision==='conflict'){conflicts++;await logIssue(uid,name,record[table.key],'Missing or unparsable revision timestamp; manual review required');continue}
    if(decision==='keep'){unchanged++;continue}
    const sig=core.fingerprint(record,table.columns);
    pending.push({id:record[table.key],record:{...record,sourceFingerprint:sig,sheetFingerprint:sig,hqSource:'google-sheet',syncOrigin:'sheet',lastMirrorAt:FieldValue.serverTimestamp()}});
  }
  for(let offset=0;offset<pending.length;offset+=300){
   const batch=db.batch();for(const item of pending.slice(offset,offset+300))batch.set(collection.doc(item.id),item.record,{merge:true});await batch.commit();
  }
  pulled[name]={read:records.length,updated:pending.length,unchanged,conflicts};
 }
 const now=new Date().toISOString();await setSyncMeta(uid,{lastSyncAt:now,lastSyncStatus:'ok',pulled,source:'google-sheet-backend'});
 return {pulled,lastSyncAt:now};
}
async function sheetMirror(uid,type,record){
 const config=await owner(uid);if(!config?.sheetId||!config?.syncEnabled)return {skipped:'not enabled'};
 const table=core.TABLES[type];if(!table)throw Error('Unexpected HQ collection');
 const data={...record};
 if(type==='jobs'){data.lastUpdated=data.lastUpdated||data.updatedAt||new Date().toISOString();if(!data.source)data.source='HQ phone request';}
 if(type==='updates'&&data.source==='Personal note')data.verification='personal_note_unverified';
 const raw=await googleValues(config.sheetId,type,2000),head=raw[0]||[];
 const keyIndex=head.indexOf(table.key);if(keyIndex<0)throw Error('Expected column '+table.key+' missing in '+table.tab);
 const idx=raw.findIndex((row,i)=>i>0&&row[keyIndex]===data[table.key]);
 const {api}=await sheetsClient();const quoted=table.tab.includes(' ')?`'${table.tab}'`:table.tab;
 const col=String.fromCharCode(65+head.length-1);
 if(idx>=1){
   const current=raw[idx],timeIdx=head.indexOf(table.time);
   const sheetTime=core.parseDateTime(current[timeIdx]||''),phoneTime=core.parseDateTime(data[table.time]||'');
   if(sheetTime!==null&&phoneTime!==null&&sheetTime>phoneTime){
     await logIssue(uid,type,data[table.key],'Phone edit conflicts with newer Google Sheet version; not overwritten');return {conflict:true};
   }
   const row=core.makeSheetRow(type,data,current,head);
   if(row.join('\u0000')===current.map(core.normalizeCell).concat(Array(Math.max(0,row.length-current.length)).fill('')).join('\u0000'))return {unchanged:true};
   await api.spreadsheets.values.update({spreadsheetId:config.sheetId,range:`${quoted}!A${idx+1}:${col}${idx+1}`,valueInputOption:'RAW',requestBody:{values:[row]}});
   return {updated:true};
 }
 const row=core.makeSheetRow(type,data,null,head);
 await api.spreadsheets.values.append({spreadsheetId:config.sheetId,range:`${quoted}!A1:${col}1`,valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[row]}});
 return {created:true};
}
async function mirrorChange(type,event){
 const uid=event.params.uid,id=event.params.itemId,change=event.data;
 const after=change?.after?.exists?change.after.data():null;
 const before=change?.before?.exists?change.before.data():null;
 if(!after||after.syncOrigin==='sheet')return;
 if(!core.meaningfulChange(type,before,after))return;
 const config=await owner(uid);if(!config?.syncEnabled||!config.sheetId)return;
 try{const result=await sheetMirror(uid,type,after);
   if(result.conflict)logger.warn('HQ conflict, preserving newer Sheet row',{type,id});
   else logger.info('HQ phone change mirrored',{type,mode:result.created?'created':result.updated?'updated':'unchanged'});
 }catch(error){logger.error('HQ phone mirror error',{type,error:wrappedError(error)});
   await setSyncMeta(uid,{lastSyncStatus:'error',lastSyncErrorType:'phone-to-sheet',lastSyncErrorAt:new Date().toISOString()});throw error;
 }
}
exports.onPhoneMission=onDocumentWritten({document:'users/{uid}/missions/{itemId}',region:REGION,maxInstances:1,concurrency:1},ev=>mirrorChange('missions',ev));
exports.onPhoneJob=onDocumentWritten({document:'users/{uid}/jobs/{itemId}',region:REGION,maxInstances:1,concurrency:1},ev=>mirrorChange('jobs',ev));
exports.onPhoneUpdate=onDocumentWritten({document:'users/{uid}/updates/{itemId}',region:REGION,maxInstances:1,concurrency:1},ev=>mirrorChange('updates',ev));
exports.connectionHealth=onCall({region:REGION,maxInstances:3},async req=>{
 const {uid,config}=await assertOwner(req);const email=await serviceEmail();let sheetAccess='not-configured';
 if(config.sheetId){try{await googleValues(config.sheetId,'missions',2);sheetAccess='ok'}catch(err){sheetAccess=String(err?.code)==='403'?'permission-denied':String(err?.code)==='404'?'not-found':'error'}}
 const sync=await db.doc(`users/${uid}/syncMeta/current`).get();
 return {serviceAccountEmail:email,sheetConfigured:!!config.sheetId,sheetAccess,syncEnabled:!!config.syncEnabled,pushEnabled:!!config.notifications?.enabled,lastSync:sync.exists?{status:sync.data().lastSyncStatus,at:sync.data().lastSyncAt||null}:null};
});
exports.configureHQ=onCall({region:REGION,maxInstances:3},async req=>{
 const {uid,config}=await assertOwner(req);const {sheetId,syncEnabled,notificationsEnabled}=req.data||{};
 if(!core.validSheetId(sheetId))throw new HttpsError('invalid-argument','A private Google Sheet ID is required.');
 if(typeof syncEnabled!=='boolean'||typeof notificationsEnabled!=='boolean')throw new HttpsError('invalid-argument','Choose the desired sync and notification settings.');
 // Even before the Sheet is shared, save the selected ID and report what must be done.
 await db.doc(`${CONFIG_DOC}/${uid}`).set({...config,sheetId,syncEnabled:false,notifications:{enabled:notificationsEnabled,quietStart:22,quietEnd:8}}, {merge:true});
 const email=await serviceEmail();
 try{await googleValues(sheetId,'missions',2)}catch(error){return {connected:false,serviceAccountEmail:email,reason:'Share only your HQ Sheet with the named service account as Editor, then tap Activate again.',status:String(error?.code||'permission_error')}}
 await db.doc(`${CONFIG_DOC}/${uid}`).set({sheetId,syncEnabled,notifications:{enabled:notificationsEnabled,quietStart:22,quietEnd:8}}, {merge:true});
 return {connected:true,serviceAccountEmail:email,syncEnabled};
});
exports.syncNow=onCall({region:REGION,maxInstances:4},async req=>{
 const {uid,config}=await assertOwner(req);
 if(!config.syncEnabled||!config.sheetId)throw new HttpsError('failed-precondition','Configure the private HQ backend first.');
 const stamp=db.doc(`users/${uid}/syncMeta/rateLimit`);
 await db.runTransaction(async tx=>{const prev=await tx.get(stamp);const last=prev.data()?.lastStartMs||0;
   if(Date.now()-last<60000)throw new HttpsError('resource-exhausted','Recent sync already running. Try again shortly.');tx.set(stamp,{lastStartMs:Date.now()},{merge:true});});
 try{return await pullSheet(uid,config)}catch(error){await setSyncMeta(uid,{lastSyncStatus:'error',lastSyncErrorType:'sheet-to-firestore',lastSyncErrorAt:new Date().toISOString()});logger.error('HQ manual pull failed',wrappedError(error));throw new HttpsError('unavailable','Could not refresh HQ using the backend service account. Check the connection status.');}
});
exports.scheduledSheetSync=onSchedule({schedule:'every 15 minutes',region:REGION,timeZone:TZ,maxInstances:1},async()=>{
 const owners=await db.collection(CONFIG_DOC).get();for(const item of owners.docs){const config=item.data();if(!config.syncEnabled||!config.sheetId)continue;
   try{await pullSheet(item.id,config)}catch(error){logger.error('HQ scheduled pull failed',{error:wrappedError(error)});await setSyncMeta(item.id,{lastSyncStatus:'error',lastSyncErrorType:'scheduled-pull',lastSyncErrorAt:new Date().toISOString()})}
 }
});
function inQuietHours(when=new Date()){const h=core.localHour(when,TZ);return h<8||h>=22;}
async function sendPrivate(uid,kind,message){const settings=await owner(uid);if(!settings?.notifications?.enabled)return {sent:0,reason:'off'};
 const snapshot=await db.collection(`users/${uid}/devices`).get();const devices=snapshot.docs.filter(d=>typeof d.data().token==='string');
 if(!devices.length)return {sent:0,reason:'no device tokens'};
 let sent=0,failed=0;
 for(let i=0;i<devices.length;i+=500){const entries=devices.slice(i,i+500);
   const tokens=entries.map(d=>d.data().token);
   const result=await admin.messaging().sendEachForMulticast({tokens,notification:{title:'Adarsh HQ',body:message},webpush:{fcmOptions:{link:WEB},notification:{tag:'adarsh-hq-'+kind,icon:WEB+'icons/icon-192.png'}}});
   sent+=result.successCount;failed+=result.failureCount;
   for(let j=0;j<result.responses.length;j++){const x=result.responses[j];if(!x.success&&/registration-token-not-registered|invalid-registration-token/.test(x.error?.code||''))await entries[j].ref.delete();}
 }
 await db.collection(`users/${uid}/notificationLog`).add({kind,sentToFcm:sent,failed,createdAt:FieldValue.serverTimestamp(),deliveryConfirmed:false});
 return {sent,failed};
}
async function dedup(uid,id,fn){const ref=db.doc(`users/${uid}/sentAlerts/${id}`);try{await ref.create({queuedAt:FieldValue.serverTimestamp()})}catch(error){if(error.code===6||/ALREADY_EXISTS/i.test(error.message))return;throw error}
 try{const r=await fn();if(!r?.sent)await ref.delete();return r}catch(error){await ref.delete();throw error}}
exports.deadlineAlerts=onSchedule({schedule:'every 30 minutes',region:REGION,timeZone:TZ,maxInstances:1},async()=>{
 if(inQuietHours())return;const date=core.localDate(new Date(),TZ);
 const users=await db.collection(CONFIG_DOC).get();for(const item of users.docs){const uid=item.id,config=item.data();if(!config.notifications?.enabled)continue;
 const tasks=await db.collection(`users/${uid}/missions`).limit(300).get();let upcoming=0,urgent=0;
 for(const doc of tasks.docs){const d=doc.data();if(d.state==='done')continue;const days=core.daysUntil(d.due,date);if(days===null)continue;if(days===0)urgent++;if([7,3,1,0].includes(days))upcoming++;}
 if(upcoming)await dedup(uid,`${date}-deadlines`,()=>sendPrivate(uid,'deadlines',urgent?'An important deadline is due today. Review your next action.':'Deadlines are approaching. Open HQ to review.'));
 }
});
exports.morningFocus=onSchedule({schedule:'0 8 * * *',region:REGION,timeZone:TZ,maxInstances:1},async()=>{
 const date=core.localDate(new Date(),TZ);const users=await db.collection(CONFIG_DOC).get();
 for(const item of users.docs){if(!item.data().notifications?.enabled)continue;const uid=item.id;const docs=await db.collection(`users/${uid}/missions`).limit(300).get();const tasks=core.topThree(docs.docs.map(d=>d.data()),date);if(!tasks.length)continue;
 await db.doc(`users/${uid}/briefings/${date}-morning`).set({date,kind:'morning',missions:tasks.map(x=>x.id),summary:'Choose one next action; keep the rest visible, not scheduled.',createdAt:FieldValue.serverTimestamp()});
 await dedup(uid,`${date}-morning`,()=>sendPrivate(uid,'focus','Your next priority is ready. Open HQ and choose one action.'));
 }
});
exports.eveningReview=onSchedule({schedule:'0 19 * * *',region:REGION,timeZone:TZ,maxInstances:1},async()=>{
 const date=core.localDate(new Date(),TZ),users=await db.collection(CONFIG_DOC).get();
 for(const item of users.docs){if(!item.data().notifications?.enabled)continue;const uid=item.id;const docs=await db.collection(`users/${uid}/missions`).limit(300).get();if(!docs.docs.some(d=>d.data().state!=='done'))continue;
 await dedup(uid,`${date}-evening`,()=>sendPrivate(uid,'review','A short end-of-day review is ready. What moved forward today?'));
 }
});
exports.jobAlerts=onDocumentUpdated({document:'users/{uid}/jobs/{itemId}',region:REGION,maxInstances:1,concurrency:1},async ev=>{
 const before=ev.data?.before.data(),after=ev.data?.after.data();if(!after||before?.status===after.status||!['approval','awaiting_approval','blocked','done'].includes(after.status)||inQuietHours())return;
 const date=core.localDate(new Date(),TZ),msg=after.status==='done'?'A task was completed. Review its evidence in HQ.':'A task needs your decision or attention. Open HQ.';
 await dedup(ev.params.uid,`${date}-${ev.params.itemId}-${after.status}`,()=>sendPrivate(ev.params.uid,'job',msg));
});
exports.testPush=onCall({region:REGION,maxInstances:3},async req=>{
 const {uid}=await assertOwner(req);if(inQuietHours())throw new HttpsError('failed-precondition','HQ quiet hours are active. Try during the day.');
 const r=await sendPrivate(uid,'test','Test alert from your private HQ.');return {acceptedByFcm:r.sent||0,failed:r.failed||0,deviceReceiptVerified:false};
});