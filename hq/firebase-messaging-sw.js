/* Optional separate worker for Firebase Cloud Messaging.
 * NOT enabled until Firebase config and push sender are set up. */
importScripts('./firebase-config.js');
if(self.HQ_FIREBASE_CONFIG?.apiKey && self.HQ_FIREBASE_CONFIG?.projectId && self.HQ_FIREBASE_CONFIG?.messagingSenderId){
 importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
 importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');
 firebase.initializeApp(self.HQ_FIREBASE_CONFIG);
 firebase.messaging();
}
self.addEventListener('notificationclick',event=>{
  event.notification.close();event.waitUntil(clients.openWindow(new URL('./',self.location.href).href));
});