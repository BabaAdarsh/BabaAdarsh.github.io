# Adarsh HQ Firebase activation (Android-first) — 14 Nov 2026

**Status:** Source code is deployed in public GitHub Pages, but *Firebase is not yet connected*. Source code contains no personal task records. Google Sheet remains the authoritative private HQ log until Firestore is explicitly imported and the ChatGPT-to-Firebase write path is verified.

## The Google-account setup (can use Chrome Desktop site on Android)
1. Go to https://console.firebase.google.com/ and use the Google account that owns your HQ. If a relevant Firebase project already exists, use it. Otherwise **Add project** → name it `adarsh-hq-private` (display name; Firebase may allocate a different project ID). Start on **Spark** if available; do not enable billing unless a feature demonstrably requires it.
2. Project overview → **Add app** → Web (`</>`) → register as `Adarsh HQ Android PWA`. Copy the **public Firebase web config** (apiKey, authDomain, projectId, appId, messagingSenderId). You do not need Firebase Hosting; the app is presently hosted at https://babaadarsh.github.io/hq/.
3. Build → Authentication → **Sign-in method** → Google → Enable. In Authentication → Settings → Authorized domains, add **`babaadarsh.github.io`** (hostname only, *no* `/hq`, no `https://`). Google sign-in through a mobile browser can require a popup; configure and test one flow at a time.
4. Build → Firestore Database → **Create database** → **Standard edition** → a region you prefer → production mode. In Firestore → Rules, paste the exact `firestore.rules` file saved next to this guide. Click **Publish**. Do **not** use test mode or rules that allow all signed-in users to read all users.
5. Project settings → Your apps → Web app → config. Paste the public config into `hq/firebase-config.js` in GitHub (or connect the Firebase plugin so ChatGPT can help update it). **NEVER** paste passwords, service-account JSON, private VAPID key, API tokens, or IRCC documents into GitHub.

## Verify on your phone
1. Visit https://babaadarsh.github.io/hq/ in Chrome on your Android phone. In Settings → Private cloud, use **Sign in with Google**. Sign in with the intended account. Check for **Live sync connected**.
2. Make one harmless sample mission, then open the same website on another device signed into the *same Firebase user* and check whether it appears. If your device has existing local missions and Firestore is initially empty, HQ now keeps local data rather than silently clearing it; use **Upload local backup** only after inspecting the existing cloud and agreeing to the overwrite warning.
3. To install, use Chrome ⋮ → Add to Home screen → Install (if offered). This is a PWA, not a Play Store APK.

## Push notifications are a separate second-stage setup
- Project settings → Cloud Messaging → Web configuration → create/import **Web Push certificates** and copy the **PUBLIC VAPID key** into `hq/firebase-config.js`.
- In HQ → Settings click **Enable background push** and allow Android notification permission. This only registers your device; it does **not** schedule or send messages.
- The Firebase console can send a **test** message to a registered device. For genuine background deadline alerts, configure an authorized server-side sender (e.g., Cloud Functions/Cloud Scheduler, possibly requiring Blaze billing). NEVER embed FCM private sending credentials in GitHub or the browser.
- The `getToken` SDK API is being deprecated; before production push deployment we should upgrade to the current registration API supported by the selected SDK release.

## The crucial ChatGPT connection
- Google Sheet: https://docs.google.com/spreadsheets/d/1zFliw-d3qbZvqRbWd24AXC1DT68Hj3GRxeS7hpnwGkM/edit — already writable through ChatGPT.
- Firebase Firestore: separate new store. **It does not automatically mirror the Google Sheet**. The next integration step is to connect the Firebase plugin in ChatGPT, verify its Firestore write/read capability, migrate the snapshot, and then make **Firestore the single live source** or build an authenticated sync bridge. Do not claim two-way sync before this step is tested.
- The app does not automatically read other ChatGPT conversations. ChatGPT should log verified progress through supported connected tools.

## Security verification
- In Firestore Rules Playground, simulate **unauthenticated read**: DENY.
- Test a signed-in user reading `users/some_other_uid/missions/test`: DENY.
- Test own-UID read/write `users/your_actual_uid/missions/test`: ALLOW.
- Test deleting a mission: DENY.
- Use a non-sensitive dummy record for the test. Keep all confidential research and immigration identity documents outside the PWA unless explicitly approved.
