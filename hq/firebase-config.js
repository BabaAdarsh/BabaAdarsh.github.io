/* Firebase Web client configuration for Adarsh HQ.
 * These are public client identifiers, NOT server credentials.
 * Firestore rules must be deployed before syncing personal records.
 * Do not commit private keys, service account JSON, login credentials or user data.
 */
globalThis.HQ_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAOMOCyYRYXzKBww8MPPRQT037mWsa587M",
  authDomain: "adarsh-hq-private.firebaseapp.com",
  projectId: "adarsh-hq-private",
  storageBucket: "adarsh-hq-private.firebasestorage.app",
  messagingSenderId: "660024483095",
  appId: "1:660024483095:web:9eacdc9eddfc18bc4d2b52",
  vapidKey: "" // Add PUBLIC Web Push key after Firebase Cloud Messaging setup.
};
