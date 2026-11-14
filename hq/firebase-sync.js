/* Optional Firebase live adapter for Adarsh HQ. It activates only after a
 * Firebase project is configured and you sign in. No second AI is started.
 * Pinned Firebase modular SDK. Do not call it before a backend is configured. */
// Cloud libraries are loaded ONLY after configuration. Local mode does not call Firebase.
const config=globalThis.HQ_FIREBASE_CONFIG||{};
const valid=!!(config.apiKey&&config.projectId&&config.appId&&config.authDomain);
if(!valid){globalThis.HQ_BRIDGE_CONFIGURED=false;}else{try{
 const [appMod,authMod,dbMod,msgMod,funcMod]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-functions.js')
 ]);
 const {initializeApp}=appMod;
 const {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut}=authMod;
 const {getFirestore,collection,doc,onSnapshot,setDoc,getDocs,runTransaction,writeBatch,serverTimestamp}=dbMod;
 const {getMessaging,isSupported,getToken,onMessage}=msgMod;
 const {getFunctions,httpsCallable}=funcMod;
 const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider(),hqFunctions=getFunctions(app,'northamerica-northeast1');
 let user=null,ready=false,unsubs=[],loaded=new Set();
 const status=(s)=>globalThis.HQ_DEBUG?.setConnection?.(s);
 const notify=(s)=>globalThis.HQ_DEBUG?.notify?.(s);
 const base=(collectionName)=>collection(db,'users',user.uid,collectionName);
 const ensure=()=>{if(!user||!ready)throw Error('Please sign in and wait for the private HQ connection to become ready.')};
 const listen=(name)=>onSnapshot(base(name),sn=>{
   const list=sn.docs.map(d=>({...d.data(),_firestoreId:d.id}));
   globalThis.HQ_DEBUG?.receiveRemote?.(name,list);
   loaded.add(name);if(loaded.size===3){ready=true;status('synced')}
 },err=>{ready=false;status('error');notify('HQ sync error: '+err.message)});
 async function signIn(){if(!valid)throw Error('Firebase is not configured.');const result=await signInWithPopup(auth,provider);return result.user?.email||'signed in';}
 async function saveMission(m,expectedUpdatedAt){ensure();const ref=doc(base('missions'),m.id);return runTransaction(db,async tx=>{
    const snap=await tx.get(ref);const prev=snap.exists()?snap.data():null;
    if(prev&&expectedUpdatedAt!==prev.updatedAt)throw Error('CONFLICT: HQ was changed on another device. Refresh before editing.');
    if(!prev&&expectedUpdatedAt)throw Error('CONFLICT: This record no longer exists.');
    tx.set(ref,{...m,updatedAt:new Date().toISOString(),syncOrigin:'phone',syncedAt:serverTimestamp()},{merge:true});
    return true;
  })}
 async function saveJob(j){ensure();const stamp=new Date().toISOString();await setDoc(doc(base('jobs'),j.jobId),{...j,lastUpdated:stamp,updatedAt:stamp,syncOrigin:'phone',syncedAt:serverTimestamp()})}
 async function saveUpdate(u){ensure();await setDoc(doc(base('updates'),u.updateId),{...u,syncOrigin:'phone',syncedAt:serverTimestamp()})}
 async function uploadLocal(data){ensure();if(!confirm('Upload LOCAL HQ records to Firebase? Matching cloud records will be overwritten. Export a backup first. This cannot be automatically undone.'))return;
   const entries=[['missions',data.missions||[],x=>x.id],['jobs',data.jobs||[],x=>x.jobId],['updates',data.updates||[],x=>x.updateId]];
   let n=0;for(const [name,rows,idfn] of entries){for(let i=0;i<rows.length;i+=350){const batch=writeBatch(db);for(const r of rows.slice(i,i+350)){if(!idfn(r))continue;const { _firestoreId,_etag,...safe }=r;batch.set(doc(base(name),idfn(r)),{...safe,syncedAt:serverTimestamp()});n++}await batch.commit()}}
   globalThis.HQ_LOCAL_PENDING=false;notify(`${n} records uploaded to private cloud HQ.`);
 }

 // Read-only, explicitly consented bridge from ChatGPT's Google HQ Sheet to the
 // user's authenticated private Firestore. Neither the Sheet URL nor OAuth
 // access token is embedded in the public app source.
 let sheetsToken='',tokenValidUntil=0,googleImportBusy=false;
 function privateSheetId(input){
   const x=String(input||'').trim();
   const m=x.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/);
   return m?m[1]:(/^[A-Za-z0-9_-]{20,}$/.test(x)?x:null);
 }
 function sheetRows(range,idName){
   const matrix=range?.values||[],keys=(matrix[0]||[]).map(String);
   if(!keys.includes(idName))throw Error('Missing '+idName+' column in Google HQ.');
   return matrix.slice(1).filter(Array.isArray).map(row=>{
     const record={};keys.forEach((k,i)=>{if(k)record[k]=String(row[i]??'')});return record;
   }).filter(r=>/^[A-Za-z0-9._-]{1,120}$/.test(r[idName]||''));
 }
 async function mergeSheet(name,list,key){
   const snapshot=await getDocs(base(name)),existing=new Map(snapshot.docs.map(d=>[d.id,d.data()]));
   const pending=[];let skipped=0;
   for(const row of list){
     const prev=existing.get(row[key]);
     if(prev){
       if(name==='updates'){skipped++;continue}
       const field=name==='jobs'?'lastUpdated':'updatedAt';
       const a=Date.parse(prev[field]||''),b=Date.parse(row[field]||'');
       // Never overwrite a newer phone edit, an unchanged record or unknown version.
       if(!Number.isFinite(a)||!Number.isFinite(b)||a>=b){skipped++;continue}
     }
     pending.push(row);
   }
   for(let i=0;i<pending.length;i+=350){
     const batch=writeBatch(db);
     for(const row of pending.slice(i,i+350)){
       batch.set(doc(base(name),row[key]),{...row,hqSource:'google-sheet',syncedAt:serverTimestamp()},{merge:true});
     }
     await batch.commit();
   }
   return {imported:pending.length,skipped};
 }
 async function syncFromGoogleHQ(sheetUrl,interactive=true){
   ensure();
   const id=privateSheetId(sheetUrl);
   if(!id)throw Error('First save your private Google HQ Sheet URL in Settings.');
   if(googleImportBusy)throw Error('A Google HQ refresh is already in progress.');
   googleImportBusy=true;
   try{
     if(!sheetsToken||Date.now()>tokenValidUntil-30000){
       if(!interactive)throw Error('The read-only Google permission expired. Tap Sync Google HQ again.');
       const authorizedUserId=auth.currentUser?.uid;
       const scoped=new GoogleAuthProvider();
       scoped.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
       const response=await signInWithPopup(auth,scoped);
       if(authorizedUserId&&response.user.uid!==authorizedUserId){
         await signOut(auth);
         throw Error('Please choose the same Google account used for the private Firebase HQ.');
       }
       sheetsToken=GoogleAuthProvider.credentialFromResult(response)?.accessToken||'';
       if(!sheetsToken)throw Error('Google did not provide read-only access to your HQ Sheet.');
       tokenValidUntil=Date.now()+48*60000;
     }
     const url=new URL('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(id)+'/values:batchGet');
     ['Missions!A1:V1000',"'HQ Jobs'!A1:Q1000","'Project Updates'!A1:M2000"].forEach(x=>url.searchParams.append('ranges',x));
     const response=await fetch(url.toString(),{headers:{Authorization:'Bearer '+sheetsToken},cache:'no-store'});
     if(!response.ok){
       if(response.status===401){sheetsToken='';tokenValidUntil=0}
       // Preserve Google's actual API failure reason; 403 alone is ambiguous.
       // Do not log or persist the OAuth token or spreadsheet content.
       const payload=await response.json().catch(()=>null);
       const problem=payload?.error||{};
       const reasons=[
         ...(Array.isArray(problem.details)?problem.details.map(d=>d?.reason):[]),
         ...(Array.isArray(problem.errors)?problem.errors.map(d=>d?.reason):[])
       ].filter(Boolean);
       const reasonCode=String(reasons[0]||problem.status||'UNKNOWN').slice(0,90);
       const googleMessage=String(problem.message||'').replace(/\s+/g,' ').slice(0,230);
       const disabled=/SERVICE_DISABLED|ACCESS_NOT_CONFIGURED|accessNotConfigured/i.test(reasonCode)
          ||/not been used in project|is disabled/i.test(googleMessage);
       const scopeMissing=/ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficientPermissions/i.test(reasonCode)
          ||/insufficient authentication scopes/i.test(googleMessage);
       let explanation;
       if(disabled)explanation='Google Sheets API is disabled for the Firebase Cloud project. Open Google Cloud Console for your project and enable Google Sheets API.';
       else if(scopeMissing)explanation='Google login did not grant the spreadsheets.readonly permission. Try the Google HQ sync consent again and check OAuth Data Access settings.';
       else if(response.status===403)explanation='Google returned a permissions error. Confirm the signed-in Google account owns or can read this Sheet, and check the Google Cloud API.';
       else if(response.status===404)explanation='The selected Google account could not find the private HQ Sheet.';
       else if(response.status===401)explanation='Google authorization has expired; tap Sync Google HQ to sign in again.';
       else explanation='The Google Sheets request failed.';
       globalThis.HQ_SHEETS_LAST_ERROR={status:response.status,code:reasonCode,detail:googleMessage};
       throw Error('Google Sheets HTTP '+response.status+' ('+reasonCode+'): '+explanation+(googleMessage?' Google says: '+googleMessage:''));
     }
     const result=await response.json();
     const [m,j,u]=result.valueRanges||[];
     if(!m||!j||!u)throw Error('The response did not include all three HQ tabs.');
     const missions=sheetRows(m,'id'),jobs=sheetRows(j,'jobId'),updates=sheetRows(u,'updateId');
     const merged={
       missions:await mergeSheet('missions',missions,'id'),
       jobs:await mergeSheet('jobs',jobs,'jobId'),
       updates:await mergeSheet('updates',updates,'updateId')
     };
     const counts={missions:missions.length,jobs:jobs.length,updates:updates.length};
     globalThis.HQ_DEBUG?.setGoogleSheetSync?.({time:new Date().toISOString(),counts});
     notify('Google HQ refreshed: '+counts.missions+' missions, '+counts.updates+' progress entries.');
     return {counts,merged};
   }finally{googleImportBusy=false}
 }
 // Automatic refresh only WHILE the app is open and the OAuth token is valid.
 // A durable closed-app bridge requires authenticated backend deployment.
 function refreshGoogleWhenOpen(){
   const link=globalThis.HQ_DEBUG?.getSheetUrl?.();
   if(user&&ready&&link&&sheetsToken&&Date.now()<tokenValidUntil-30000&&!googleImportBusy){
     syncFromGoogleHQ(link,false).catch(e=>console.info('Google HQ refresh deferred:',e.message));
   }
 }
 window.setInterval(refreshGoogleWhenOpen,4*60*1000);
 window.addEventListener('focus',refreshGoogleWhenOpen);


 // Optional authenticated background worker. The normal PWA remains usable if
 // Firebase Cloud Functions are not deployed; no second AI is involved.
 const callable=(name)=>httpsCallable(hqFunctions,name);
 function presentFunctionError(error){
   const code=String(error?.code||'');
   if(code.includes('not-found')||code.includes('unavailable'))
     throw Error('HQ background worker is not deployed or not reachable. Firebase sync within the app still works; automated background updates and push require a one-time deployment.');
   if(code.includes('permission-denied'))throw Error('Your Firebase account is not on the HQ owner allowlist.');
   throw Error(String(error?.message||error||'Background connection failed').slice(0,360));
 }
 async function connectionHealth(){ensure();try{
   const result=await callable('connectionHealth')({});
   globalThis.HQ_DEBUG?.setBackendHealth?.(result.data);
   return result.data;
 }catch(error){presentFunctionError(error)}}
 async function configureBackground(data){ensure();try{
   const result=await callable('configureHQ')(data);
   globalThis.HQ_DEBUG?.setBackendHealth?.({...result.data,syncEnabled:!!result.data?.syncEnabled});
   return result.data;
 }catch(error){presentFunctionError(error)}}
 async function backgroundSyncNow(){ensure();try{
   const result=await callable('syncNow')({});
   notify('Background HQ worker checked the private Google Sheet.');
   return result.data;
 }catch(error){presentFunctionError(error)}}
 async function backgroundTestPush(){ensure();try{
   const result=await callable('testPush')({});
   return result.data;
 }catch(error){presentFunctionError(error)}}

 async function enablePush(){ensure();if(!config.vapidKey)throw Error('Add your public VAPID key in firebase-config.js first.');if(!('Notification' in window))throw Error('This browser cannot display push notifications.');
   const p=await Notification.requestPermission();if(p!=='granted')throw Error('Notifications were not allowed.');if(!await isSupported())throw Error('Firebase Messaging is not supported in this browser.');
   const reg=await navigator.serviceWorker.register('./firebase-messaging-sw.js',{scope:'./push/'});
   const messaging=getMessaging(app);const token=await getToken(messaging,{vapidKey:config.vapidKey,serviceWorkerRegistration:reg});if(!token)throw Error('No push token was returned.');
   let deviceId=localStorage.getItem('hq-device-id');if(!deviceId){deviceId='device-'+crypto.randomUUID();localStorage.setItem('hq-device-id',deviceId)}
   await setDoc(doc(base('devices'),deviceId),{token,createdAt:new Date().toISOString(),platform:navigator.userAgent.slice(0,140)});
   onMessage(messaging,payload=>{notify(payload?.notification?.title||'New HQ update received')});notify('This device is registered for push. Delivery still requires a configured sender.');
 }
 onAuthStateChanged(auth,current=>{
   unsubs.forEach(f=>f());unsubs=[];loaded.clear();ready=false;user=current;
   if(!current){status('signed_out');return}
   status('connecting');
   ['missions','jobs','updates'].forEach(n=>unsubs.push(listen(n)));
 });
 globalThis.HQ_BRIDGE={signIn,signOut:()=>signOut(auth),saveMission,saveJob,saveUpdate,uploadLocal,enablePush,syncFromGoogleHQ,connectionHealth,configureBackground,backgroundSyncNow,backgroundTestPush,getUser:()=>user,isReady:()=>ready,isConfigured:()=>valid};
 globalThis.HQ_BRIDGE_CONFIGURED=true;
 status('signed_out');
}catch(error){
 globalThis.HQ_BRIDGE_CONFIGURED=false;
 globalThis.HQ_BRIDGE_LOAD_ERROR=String(error?.message||error);
 globalThis.HQ_DEBUG?.setConnection?.('error');
 globalThis.HQ_DEBUG?.notify?.('Firebase libraries could not be loaded. Please open HQ in Chrome and check your internet connection.');
}
}