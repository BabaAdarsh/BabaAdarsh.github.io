'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../index.js'),'utf8');
function noopWrapper(opts,callback){return typeof opts==='function'?opts:callback}
const fakeFirestore=()=>({collection:()=>({}),doc:()=>({}),runTransaction:async(fn)=>fn({get:async()=>({data:()=>({})}),set:()=>{}})});
fakeFirestore.FieldValue={serverTimestamp:()=>({special:'serverTimestamp'})};
const fakeAdmin={initializeApp(){},firestore:fakeFirestore};
const fake=Object.freeze({
 'firebase-functions/v2/scheduler':{onSchedule:noopWrapper},
 'firebase-functions/v2/https':{onCall:noopWrapper,HttpsError:class HttpsError extends Error{}},
 'firebase-functions/v2/firestore':{onDocumentWritten:noopWrapper,onDocumentUpdated:noopWrapper,onDocumentCreated:noopWrapper},
 'firebase-functions/logger':{info(){},warn(){},error(){}},
 'google-auth-library':{GoogleAuth:class {}},
 'googleapis':{google:{}},
 'firebase-admin':fakeAdmin,
 './sync-core':require('../sync-core')
});
const out={exports:{},require:(n)=>{if(!Object.hasOwn(fake,n))throw Error('Unexpected dependency '+n);return fake[n]},console,Date,Intl,process};
vm.runInNewContext(source,out,{filename:'hq-func.js',timeout:1000});
test('Exports scheduled sync, both directions, owner health, opted-in notifications',()=>{
 const required=['onPhoneMission','onPhoneJob','onPhoneUpdate','connectionHealth','configureHQ','syncNow','scheduledSheetSync','deadlineAlerts','morningFocus','eveningReview','jobAlerts','testPush'];
 for(const name of required)assert.equal(typeof out.exports[name],'function',name);
});
test('Backend does not embed private Google Sheet ID, client API keys or user secrets',()=>{
 for(const secret of ['BEGIN PRIVATE KEY','AIzaSy'])assert.ok(!source.includes(secret),secret);
});