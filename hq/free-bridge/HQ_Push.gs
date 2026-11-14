/**
 * Adarsh HQ optional Android push sender — free-only, opt-in.
 * Add as a SEPARATE Apps Script file beside HQ_FreeBridge Code.gs.
 * Uses the script owner's short-lived Google OAuth token; no private key,
 * FCM server key, extra AI service, email, Blaze or Cloud Functions.
 * Requires manifest scope https://www.googleapis.com/auth/firebase.messaging,
 * FCM HTTP v1 API access and cloudmessaging.messages.create permission.
 *
 * IMPORTANT: Nothing sends automatically until HQ_PUSH_ENABLED=true and
 * hqInstallPushTrigger() is run deliberately by the owner.
 */
var HQ_PUSH = Object.freeze({
  PROJECT: 'adarsh-hq-private',
  ENDPOINT: 'https://fcm.googleapis.com/v1/projects/adarsh-hq-private/messages:send',
  LANDING_URL: 'https://babaadarsh.github.io/hq/',
  ZONE: 'America/Toronto',
  LIMIT_DEVICES: 5,
  MORNING_HOUR: 9,
  EVENING_HOUR: 19
});
function hqPushProperties_(){return PropertiesService.getScriptProperties();}
function hqPushEnabled_(){return hqPushProperties_().getProperty('HQ_PUSH_ENABLED')==='true';}
function hqPushDevices_(){
  var cfg=hqConfig_(),records=hqReadCollection_(cfg.uid,'devices');
  return records.filter(function(d){return typeof d.token==='string'&&d.token.length>40;}).slice(0,HQ_PUSH.LIMIT_DEVICES);
}
function hqPushExplain_(status,payload){
  var problem=payload&&payload.error||{},detail=String(problem.message||'').slice(0,160);
  if(status===401||status===403)return 'FCM access denied (HTTP '+status+'). Confirm manifest firebase.messaging scope, Google Cloud Messaging API and your account cloudmessaging.messages.create permission. '+detail;
  if(status===404)return 'FCM endpoint or registration token unavailable. Confirm project and re-register phone notifications.';
  if(status===429)return 'FCM rate limit reached; automatic HQ notifications paused.';
  return 'FCM HTTP '+status+': '+detail;
}
function hqPushSend_(token,kind,validateOnly){
  if(typeof token!=='string'||token.length<40)throw new Error('Missing an active private Android push registration.');
  var message={
    token:token,
    notification:{
      title:kind==='test'?'Adarsh HQ test notification':'Adarsh HQ — one next action',
      body:kind==='test'?'Private push delivery test. No email and no extra charge.':'Open HQ to choose one useful 20-minute action.'
    },
    webpush:{fcm_options:{link:HQ_PUSH.LANDING_URL}}
  };
  var payload={message:message};
  if(validateOnly)payload.validate_only=true;
  var response=UrlFetchApp.fetch(HQ_PUSH.ENDPOINT,{
    method:'post',
    contentType:'application/json',
    payload:JSON.stringify(payload),
    headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},
    muteHttpExceptions:true
  });
  var status=response.getResponseCode(),json={};
  try{json=JSON.parse(response.getContentText())}catch(ignore){}
  if(status<200||status>=300)throw new Error(hqPushExplain_(status,json));
  // Never log, expose or persist registration tokens or the OAuth token.
  return {accepted:true,validatedOnly:!!validateOnly};
}
function hqPushProbe(){
  var devices=hqPushDevices_();
  var result={hasDevices:devices.length>0,registeredDevices:devices.length,
    dailyPushEnabled:hqPushEnabled_(),testAvailable:devices.length>0,
    mailRemindersEnabled:hqPushProperties_().getProperty('HQ_EMAIL_REMINDERS')==='true'};
  console.log(JSON.stringify(result));return result;
}
/** Owner intentionally runs this function to test actual private phone delivery. */
function hqPushTest(){
  var devices=hqPushDevices_();
  if(!devices.length)throw new Error('No registered HQ phone. Enable background push in your signed-in Android HQ first.');
  var accepted=0;
  devices.forEach(function(d){try{hqPushSend_(d.token,'test',false);accepted++}catch(e){console.error('Push delivery request rejected: '+String(e.message).slice(0,200));}});
  if(!accepted)throw new Error('FCM did not accept a test message. Check execution errors for the specific authentication issue.');
  var result={acceptedByFcm:accepted,deliveredToPhone:'not yet verified'};
  console.log(JSON.stringify(result));return result;
}
/** Validation does not actually send a notification. */
function hqPushValidate(){
  var devices=hqPushDevices_();
  if(!devices.length)throw new Error('Register a signed-in HQ device before validating a push.');
  var result=hqPushSend_(devices[0].token,'test',true);
  console.log('FCM request validation accepted; no notification sent.');
  return result;
}
function hqPushTick(){
  if(!hqPushEnabled_())return {skipped:'off'};
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(10000))return {skipped:'busy'};
  try{
    var props=hqPushProperties_(),now=new Date();
    var day=Utilities.formatDate(now,HQ_PUSH.ZONE,'yyyy-MM-dd');
    var hour=Number(Utilities.formatDate(now,HQ_PUSH.ZONE,'H'));
    var slot=hour===HQ_PUSH.MORNING_HOUR?'morning':hour===HQ_PUSH.EVENING_HOUR?'evening':null;
    if(!slot)return {skipped:'outside 9am/7pm Toronto windows'};
    var key='HQ_PUSH_SENT_'+day+'_'+slot;
    if(props.getProperty(key))return {skipped:'already sent '+slot};
    var devices=hqPushDevices_();
    if(!devices.length)return {skipped:'no registered phones'};
    var accepted=0;
    devices.forEach(function(d){
      try{hqPushSend_(d.token,slot,false);accepted++}
      catch(e){console.error('FCM request failed for a registered device: '+String(e.message).slice(0,180));}
    });
    if(!accepted)return {skipped:'no FCM requests accepted'};
    props.setProperty(key,new Date().toISOString());
    console.log('FCM accepted '+accepted+' HQ '+slot+' notification(s); actual Android display is not verified.');
    return {acceptedByFcm:accepted,slot:slot,deliveredToPhone:'unverified'};
  }finally{lock.releaseLock();}
}
function hqInstallPushTrigger(){
  if(!hqPushEnabled_())throw new Error('Opt in first: set HQ_PUSH_ENABLED=true in private Script Properties. Default is OFF.');
  var all=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hqPushTick';});
  all.forEach(function(t){ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger('hqPushTick').timeBased().everyMinutes(15).create();
  return {created:true,minutes:15};
}
function hqRemovePushTrigger(){
  var all=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='hqPushTick';});
  all.forEach(function(t){ScriptApp.deleteTrigger(t);});
  hqPushProperties_().setProperty('HQ_PUSH_ENABLED','false');
  return {removed:all.length,notificationsOff:true};
}
