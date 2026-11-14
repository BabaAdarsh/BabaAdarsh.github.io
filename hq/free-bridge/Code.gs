/** Adarsh HQ Free Bridge v1.6 — no Blaze, no service-account keys, no AI API.
 * Install BOUND TO THE PRIVATE HQ SHEET under the same Google account that owns
 * Firebase project adarsh-hq-private. All operations are owner initiated.
 * ScriptApp.getOAuthToken() is scoped using appsscript.json. For Firestore
 * calls, link this script to the SAME STANDARD CLOUD PROJECT as Firebase.
 */
var HQ_FREE = Object.freeze({
  PROJECT: 'adarsh-hq-private',
  TZ: 'America/Toronto',
  TAB: {
    missions: {title:'Missions', key:'id', stamp:'updatedAt', cols:['id','title','domain','priority','due','dueKind','state','owner','outcome','nextAction','notes','source','url','followUp','stepsJSON','eventLogJSON','evidence','approval','taskMode','draft','createdAt','updatedAt']},
    jobs: {title:'HQ Jobs', key:'jobId', stamp:'lastUpdated', cols:['jobId','createdAt','project','request','mode','status','priority','organizer','lanesJSON','plan','resultSummary','resultLinksJSON','approvalState','lastUpdated','lastChecked','version','source']},
    updates: {title:'Project Updates', key:'updateId', stamp:'timestamp', cols:['timestamp','missionId','project','summary','completed','remaining','nextAction','blocker','evidenceUrl','source','verification','recordedBy','updateId']}
  },
  PAGE: 180,
  MAX_PER_TICK: 500,
  ROOT: 'https://firestore.googleapis.com/v1/projects/adarsh-hq-private/databases/(default)/documents/users/'
});

function hqProps_(){return PropertiesService.getScriptProperties();}
function hqConfig_(){
  var p = hqProps_(); var uid=(p.getProperty('FIREBASE_UID')||'').trim();
  if (!/^[A-Za-z0-9_-]{12,160}$/.test(uid)) throw new Error('Set FIREBASE_UID in Apps Script → Project Settings → Script Properties. Do not publish your UID.');
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script via the private HQ Google Sheet: Extensions → Apps Script.');
  return {uid:uid,ss:ss,reminders:p.getProperty('HQ_EMAIL_REMINDERS')==='true',
    reminderEmail:(p.getProperty('HQ_SELF_EMAIL')||'').trim()};
}
function hqUrl_(uid, name, id){
  var path=HQ_FREE.ROOT+encodeURIComponent(uid)+'/'+name;
  if (id) path+='/'+encodeURIComponent(id);
  return path;
}
function hqRest_(url,method,body){
  var opts={method:method||'get',headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true};
  if(body!==undefined){opts.contentType='application/json';opts.payload=JSON.stringify(body);}
  var r=UrlFetchApp.fetch(url,opts),status=r.getResponseCode(),txt=r.getContentText();
  if(status===404 && method==='get')return null;
  if(status<200||status>=300){
    var msg='HTTP '+status;try{var parsed=JSON.parse(txt);msg+=': '+String(parsed.error&&parsed.error.message||'').slice(0,220)}catch(ignore){}
    throw new Error('Private Firestore '+msg+'. Check Apps Script Cloud project and datastore OAuth scope.');
  }
  return txt?JSON.parse(txt):{};
}
function hqEncode_(value){
  if(value===null||value===undefined)return {nullValue:null};
  if(typeof value==='boolean')return {booleanValue:value};
  if(typeof value==='number'&&Number.isFinite(value))return {doubleValue:value};
  return {stringValue:String(value)};
}
function hqDecode_(v){
  if(!v)return '';
  if(Object.prototype.hasOwnProperty.call(v,'stringValue'))return String(v.stringValue);
  if(Object.prototype.hasOwnProperty.call(v,'integerValue'))return String(v.integerValue);
  if(Object.prototype.hasOwnProperty.call(v,'doubleValue'))return String(v.doubleValue);
  if(Object.prototype.hasOwnProperty.call(v,'booleanValue'))return v.booleanValue;
  if(Object.prototype.hasOwnProperty.call(v,'timestampValue'))return v.timestampValue;
  if(Object.prototype.hasOwnProperty.call(v,'mapValue'))return JSON.stringify(v.mapValue);
  return '';
}
function hqFromDoc_(doc){
  var out={};Object.keys(doc.fields||{}).forEach(function(k){out[k]=hqDecode_(doc.fields[k]);});
  out._fsUpdateTime=doc.updateTime||'';
  return out;
}
function hqReadCollection_(uid,name){
  var next='',all=[],seen=0;
  do {
    var query='?pageSize='+HQ_FREE.PAGE+(next?'&pageToken='+encodeURIComponent(next):'');
    var obj=hqRest_(hqUrl_(uid,name)+query,'get')||{};
    (obj.documents||[]).forEach(function(doc){var x=hqFromDoc_(doc);x._id=doc.name.split('/').pop();all.push(x);});
    next=obj.nextPageToken||'';seen++;
    if(seen>10)throw new Error('Too many Firestore pages; stopped to protect Apps Script quota.');
  }while(next);
  return all;
}
function hqWriteDoc_(uid,name,id,record){
  var fields={},names=[];
  Object.keys(record).forEach(function(k){if(k[0]==='_')return;fields[k]=hqEncode_(record[k]);names.push(k);});
  // updateMask prevents wiping unknown fields on the phone record.
  var mask=names.map(function(k){return 'updateMask.fieldPaths='+encodeURIComponent(k)}).join('&');
  return hqRest_(hqUrl_(uid,name,id)+'?'+mask,'patch',{fields:fields});
}
function hqSheetRecords_(ss,def){
  var sh=ss.getSheetByName(def.title);if(!sh)throw new Error('Missing private Sheet tab '+def.title);
  var values=sh.getDataRange().getDisplayValues();
  var head=values[0]||[],key=def.key,pos=head.indexOf(key);
  if(pos<0)throw new Error('Missing key column '+key+' in '+def.title);
  var rows=[],byId={};
  for(var i=1;i<values.length;i++){
    var a=values[i];if(!a[pos])continue;
    var obj={};head.forEach(function(h,j){if(h)obj[h]=a[j]||'';});
    if(!/^[A-Za-z0-9._-]{1,120}$/.test(obj[key]||''))continue;
    obj._row=i+1;rows.push(obj);byId[obj[key]]=obj;
  }
  return {sh:sh,heads:head,rows:rows,byId:byId};
}
function hqDate_(s){var n=Date.parse(String(s||''));return Number.isFinite(n)?n:null;}
function hqEqual_(a,b,fields){return fields.every(function(f){return String(a[f]??'')===String(b[f]??'')});}
function hqForSheet_(record,heads){var x={};heads.forEach(function(h){if(h)x[h]=record[h]===undefined?'':String(record[h])});return x;}
function hqWriteRow_(data,doc,def){
  var sh=data.sh,heads=data.heads,id=String(doc[def.key]);
  var prev=data.byId[id],values=heads.map(function(col){
    return doc[col]===undefined?(prev&&prev[col]||''):String(doc[col]??'');
  });
  // Never evaluate spreadsheet formula text from a phone request.
  values=values.map(function(x){return /^[=+\-@]/.test(x)?"'"+x:x;});
  if(prev){sh.getRange(prev._row,1,1,values.length).setValues([values]);}
  else {sh.appendRow(values);}
  // Keep the local row index current so a subsequent read cannot duplicate it.
  var newObj=hqForSheet_(doc,heads);newObj._row=prev?prev._row:sh.getLastRow();data.byId[id]=newObj;
}
function hqSyncOne_(uid,name,ss){
  var def=HQ_FREE.TAB[name],sheet=hqSheetRecords_(ss,def),fire=hqReadCollection_(uid,name),cloud={};
  fire.forEach(function(doc){cloud[doc[def.key]||doc._id]=doc});
  var stats={sheetToPhone:0,phoneToSheet:0,unchanged:0,conflicts:0};
  var ids={};sheet.rows.forEach(function(x){ids[x[def.key]]=1;});fire.forEach(function(x){ids[x[def.key]||x._id]=1;});
  var items=Object.keys(ids);
  if(items.length>HQ_FREE.MAX_PER_TICK)throw new Error('Exceeded safe batch size for '+name+'.');
  items.forEach(function(id){
    var a=sheet.byId[id],b=cloud[id];
    if(a&&!b){
      var record=hqForSheet_(a,sheet.heads);record.syncOrigin='sheet';record.hqSource='google-sheet';
      hqWriteDoc_(uid,name,id,record);stats.sheetToPhone++;return;
    }
    if(!a&&b){
      // Only import recognized valid phone records, no unknown entity creation.
      if(b.syncOrigin==='phone'){
        hqWriteRow_(sheet,b,def);stats.phoneToSheet++;
      }else stats.conflicts++;
      return;
    }
    if(!a||!b)return;
    var normal=hqForSheet_(b,sheet.heads);
    if(hqEqual_(a,normal,sheet.heads)){stats.unchanged++;return;}
    if(name==='updates'){
      // Immutable journal: keep the Sheet row, never rewrite verified work.
      stats.conflicts++;return;
    }
    var aT=hqDate_(a[def.stamp]),bT=hqDate_(b[def.stamp]);
    if(aT===null||bT===null||aT===bT){stats.conflicts++;return;}
    if(aT>bT){
      var fromSheet=hqForSheet_(a,sheet.heads);fromSheet.syncOrigin='sheet';fromSheet.hqSource='google-sheet';
      hqWriteDoc_(uid,name,id,fromSheet);stats.sheetToPhone++;
    }else if(b.syncOrigin==='phone'){
      hqWriteRow_(sheet,b,def);stats.phoneToSheet++;
    }else stats.conflicts++;
  });
  return stats;
}
/** Test access without ever changing a mission. Run this before installing triggers. */
function hqCheckConnection(){
  var cfg=hqConfig_();
  var probe=hqRest_(hqUrl_(cfg.uid,'missions')+'?pageSize=1','get');
  var result={ok:true,sheet:cfg.ss.getName(),firestoreProject:HQ_FREE.PROJECT,
    firebaseUidSuffix:cfg.uid.slice(-4),foundMissions:(probe.documents||[]).length,
    reminderOptIn:cfg.reminders};
  console.log(JSON.stringify(result));return result;
}
function hqTick(){
  var lock=LockService.getScriptLock();if(!lock.tryLock(15000))return {skipped:'already running'};
  try {
    var cfg=hqConfig_();var stats={};
    Object.keys(HQ_FREE.TAB).forEach(function(t){stats[t]=hqSyncOne_(cfg.uid,t,cfg.ss)});
    var props=hqProps_(),stamp=new Date().toISOString();
    props.setProperty('HQ_LAST_SUCCESS',stamp);
    props.deleteProperty('HQ_LAST_ERROR');
    // The Android app already listens to this private sync-health record.
    // A real timestamp will only appear after the owner runs this actual script.
    hqWriteDoc_(cfg.uid,'syncMeta','current',{lastSyncAt:stamp,lastSyncStatus:'ok',syncEnabled:true,syncEngine:'apps-script-free',countsJson:JSON.stringify(stats)});
    hqMaybeEmail_(cfg);
    console.log(JSON.stringify({status:'ok',stats:stats}));return stats;
  }catch(e){hqProps_().setProperty('HQ_LAST_ERROR',String(e).slice(0,240));console.error('HQ sync failed: '+String(e));throw e;}
  finally{lock.releaseLock()}
}
/** Script triggers are owner-created and the only persistent background runner. */
function hqInstallFreeTriggers(){
  hqCheckConnection();
  var ours=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hqTick'});
  ours.forEach(function(t){ScriptApp.deleteTrigger(t)});
  ScriptApp.newTrigger('hqTick').timeBased().everyMinutes(15).create();
  console.log('One free HQ scheduled trigger installed: 15 minutes, no paid API.');
  return {created:true,minutes:15};
}
function hqRemoveFreeTriggers(){
  var ours=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hqTick'});
  ours.forEach(function(t){ScriptApp.deleteTrigger(t)});
  return {removed:ours.length};
}
/** We do not send email until both values are explicitly set by the user. */
function hqMaybeEmail_(cfg){
  if(!cfg.reminders||!cfg.reminderEmail)return {skipped:'off'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.reminderEmail))throw new Error('Invalid HQ_SELF_EMAIL property');
  var zone=HQ_FREE.TZ,now=new Date();
  var day=Utilities.formatDate(now,zone,'yyyy-MM-dd');
  var hour=Number(Utilities.formatDate(now,zone,'H'));
  if(hour<8||hour>=22)return {skipped:'quiet'};
  var props=hqProps_();var slot=hour>=19&&hour<20?'evening':hour>=8&&hour<9?'morning':null;
  if(!slot)return {skipped:'outside daily briefing window'};
  var key='HQ_DIGEST_'+day+'_'+slot;
  if(props.getProperty(key))return {skipped:'already sent'};
  var sheet=hqSheetRecords_(cfg.ss,HQ_FREE.TAB.missions);
  var active=sheet.rows.filter(function(m){return m.state!=='done'}).map(function(m){
    var n=Math.max(1,Math.min(10,Number(m.priority)||5));
    var due=m.due&&/^\d{4}-\d\d-\d\d$/.test(m.due)?m.due:'';
    return {title:m.title,priority:n,due:due,next:m.nextAction||'',score:n*10+(due&&due<=day?40:0)};
  }).sort(function(a,b){return b.score-a.score}).slice(0,3);
  var body=['Adarsh HQ — '+slot+' check-in','',
    'Choose ONE meaningful action rather than adding tasks.',''];
  active.forEach(function(x,i){body.push((i+1)+'. '+x.title+(x.due?' (due '+x.due+')':''));body.push('   Next: '+(x.next||'decide the first step'))});
  body.push('','Open your private HQ: https://babaadarsh.github.io/hq/',
    'Continue the work with ChatGPT. This email is generated from your private Google HQ Sheet.',
    'You can turn it off by setting HQ_EMAIL_REMINDERS=false in Apps Script properties.');
  if(MailApp.getRemainingDailyQuota()<1)return {skipped:'email quota'};
  MailApp.sendEmail({to:cfg.reminderEmail,subject:'HQ: '+(slot==='morning'?'Your one next action':'Evening follow-through'),body:body.join('\n'),name:'Adarsh HQ'});
  props.setProperty(key,new Date().toISOString());return {sent:true,slot:slot};
}
function hqStatus(){var p=hqProps_();return {lastSuccess:p.getProperty('HQ_LAST_SUCCESS')||null,
  lastError:p.getProperty('HQ_LAST_ERROR')||null,
  reminderOptIn:p.getProperty('HQ_EMAIL_REMINDERS')==='true',
  triggers:ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hqTick'}).length};}