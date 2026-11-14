/* Optional Firebase live adapter for Adarsh HQ. It activates only after a
 * Firebase project is configured and you sign in. No second AI is started.
 * Pinned Firebase modular SDK. Do not call it before a backend is configured. */
// Cloud libraries are loaded ONLY after configuration. Local mode does not call Firebase.
const config=globalThis.HQ_FIREBASE_CONFIG||{};
const valid=!!(config.apiKey&&config.projectId&&config.appId&&config.authDomain);
if(!valid){globalThis.HQ_BRIDGE_CONFIGURED=false;}else{
 const [appMod,authMod,dbMod,msgMod]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'),
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js')
 ]);
 const {initializeApp}=appMod;
 const {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signInWithRedirect,signOut}=authMod;
 const {getFirestore,collection,doc,onSnapshot,setDoc,runTransaction,writeBatch,serverTimestamp}=dbMod;
 const {getMessaging,isSupported,getToken,onMessage}=msgMod;
 const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
 let user=null,ready=false,unsubs=[],got=0;
 const status=(s)=>globalThis.HQ_DEBUG?.setConnection?.(s);
 const notify=(s)=>globalThis.HQ_DEBUG?.notify?.(s);
 const base=(collectionName)=>collection(db,'users',user.uid,collectionName);
 const ensure=()=>{if(!user||!ready)throw Error('Please sign in and wait for the private HQ connection to become ready.')};
 const listen=(name)=>onSnapshot(base(name),sn=>{
   const list=sn.docs.map(d=>({...d.data(),_firestoreId:d.id}));
   globalThis.HQ_DEBUG?.receiveRemote?.(name,list);
   got++;if(got>=3){ready=true;status('synced')}
 },err=>{ready=false;status('error');notify('HQ sync error: '+err.message)});
 async function signIn(){if(!valid)throw Error('Firebase is not configured.');try{await signInWithPopup(auth,provider);}catch(e){if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e.code)){await signInWithRedirect(auth,provider)}else throw e}}
 async function saveMission(m,expectedUpdatedAt){ensure();const ref=doc(base('missions'),m.id);return runTransaction(db,async tx=>{
    const snap=await tx.get(ref);const prev=snap.exists()?snap.data():null;
    if(prev&&expectedUpdatedAt!==prev.updatedAt)throw Error('CONFLICT: HQ was changed on another device. Refresh before editing.');
    if(!prev&&expectedUpdatedAt)throw Error('CONFLICT: This record no longer exists.');
    tx.set(ref,{...m,updatedAt:new Date().toISOString(),syncedAt:serverTimestamp()},{merge:true});
    return true;
  })}
 async function saveJob(j){ensure();await setDoc(doc(base('jobs'),j.jobId),{...j,updatedAt:new Date().toISOString(),syncedAt:serverTimestamp()})}
 async function saveUpdate(u){ensure();await setDoc(doc(base('updates'),u.updateId),{...u,syncedAt:serverTimestamp()})}
 async function uploadLocal(data){ensure();if(!confirm('Upload your LOCAL HQ data into your private cloud workspace? Existing matching IDs will be replaced. Use only when you are sure.'))return;
   const entries=[['missions',data.missions||[],x=>x.id],['jobs',data.jobs||[],x=>x.jobId],['updates',data.updates||[],x=>x.updateId]];
   let n=0;for(const [name,rows,idfn] of entries){for(let i=0;i<rows.length;i+=350){const batch=writeBatch(db);for(const r of rows.slice(i,i+350)){if(!idfn(r))continue;const { _firestoreId,_etag,...safe }=r;batch.set(doc(base(name),idfn(r)),{...safe,syncedAt:serverTimestamp()});n++}await batch.commit()}}
   notify(`${n} records uploaded to private cloud HQ.`);
 }
 async function enablePush(){ensure();if(!config.vapidKey)throw Error('Add your public VAPID key in firebase-config.js first.');if(!('Notification' in window))throw Error('This browser cannot display push notifications.');
   const p=await Notification.requestPermission();if(p!=='granted')throw Error('Notifications were not allowed.');if(!await isSupported())throw Error('Firebase Messaging is not supported in this browser.');
   const reg=await navigator.serviceWorker.register('./firebase-messaging-sw.js',{scope:'./push/'});
   const messaging=getMessaging(app);const token=await getToken(messaging,{vapidKey:config.vapidKey,serviceWorkerRegistration:reg});if(!token)throw Error('No push token was returned.');
   let deviceId=localStorage.getItem('hq-device-id');if(!deviceId){deviceId='device-'+crypto.randomUUID();localStorage.setItem('hq-device-id',deviceId)}
   await setDoc(doc(base('devices'),deviceId),{token,createdAt:new Date().toISOString(),platform:navigator.userAgent.slice(0,140)});
   onMessage(messaging,payload=>{notify(payload?.notification?.title||'New HQ update received')});notify('This device is registered for push. Delivery still requires a configured sender.');
 }
 onAuthStateChanged(auth,current=>{
   unsubs.forEach(f=>f());unsubs=[];got=0;ready=false;user=current;
   if(!current){status('signed_out');return}
   status('connecting');
   ['missions','jobs','updates'].forEach(n=>unsubs.push(listen(n)));
 });
 globalThis.HQ_BRIDGE={signIn,signOut:()=>signOut(auth),saveMission,saveJob,saveUpdate,uploadLocal,enablePush,getUser:()=>user,isReady:()=>ready,isConfigured:()=>valid};
 globalThis.HQ_BRIDGE_CONFIGURED=true;
 status('signed_out');
}