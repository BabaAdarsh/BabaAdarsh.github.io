# Adarsh HQ v1.0 — private sync and notification deployment

**State:** Code-built and locally unit-tested. **Not deployed.** Firebase authorization, resource deployment, device token registration and end-to-end tests remain necessary. This worker is *not* another AI: ChatGPT remains the only assistant.

## What the backend will do after authorized deployment

1. Every 15 minutes, read the three tabs in the private HQ Google Sheet through a Google Cloud **service account** and mirror only new/changed rows into the authenticated user's Firestore (`users/{uid}/missions`, `/jobs`, `/updates`). Existing phone edits with newer timestamps are not silently overwritten. It records sync health and conflicts.
2. When a phone record is created or edited, Firestore triggers write its changes back to the matching Google Sheet row. Existing untouched columns in the Sheet are preserved. Phone-submitted jobs become visible to ChatGPT through the `HQ Jobs` tab and the existing hourly ChatGPT HQ automation. **This is not instant ChatGPT execution**: user can instead paste a handoff prompt to begin work in the current conversation.
3. When explicitly enabled, scheduled functions prepare one morning focus and an optional evening review, plus *generic* deadline and approval notifications to registered Firebase Cloud Messaging (FCM) tokens. A successful FCM send only means the service accepted it, **not** that the phone displayed it.
4. An authenticated `connectionHealth` callable shows the server-side service-account email and sync status. An authenticated `configureHQ` callable records the Sheet ID and opt-in toggles, then confirms access. `syncNow` can request a bounded manual refresh.

## Required owner actions (one-time)

1. In the Firebase project **adarsh-hq-private**, activate a billing plan that permits Cloud Functions if you accept potential charges. The PWA/Firebase Authentication and Firestore setup is already working. Deploy from your Google/Firebase project after reviewing the repo's `hq/backend` code. The GitHub repo is public, so NEVER commit admin credentials, service-account JSON, OAuth tokens, or your private HQ data.
2. Create a **user-managed service account** (recommended) for the backend with only the runtime roles it actually needs. Assign it as the Cloud Functions runtime identity, without downloading any service-account key. On a simpler preconfigured Firebase deployment, the runtime service identity is shown by `connectionHealth`. Both methods rely on Workload Identity / Application Default Credentials.
3. Open the private existing **Adarsh HQ — Mission Database v0.2** Google Sheet, select **Share**, add that exact service-account email as **Editor** *only to this Sheet*, and turn off email notifications. This grants the worker read/write access to this file; it does not grant broad access to Drive. Confirm the correct email in the Firebase function configuration before sharing. Google Sheets API must be enabled in the same Google Cloud project.
4. Deploy the tightened Firestore rules (they preserve owner-only access) and deploy the Functions using Firebase CLI from a trusted terminal. The backend source is at `hq/backend/functions`, rules at `hq/backend/firestore.rules`. The `backend/firebase.json` is a deployment example, not a complete replacement for your existing hosting configuration.
5. Sign in to the Android HQ app. Use **Background sync setup** to see the service-account email and activate the bridge after sharing the sheet. Turn on **Reminder notifications** only if you want them. In Firebase Console, create a public **Web Push VAPID key** and put it into the PWA's `firebase-config.js` (public key only). Then use **Enable background push** to register the device. Never put the private VAPID key in the app.
6. Prove a complete round trip: edit a harmless test task on phone → see the same ID updated in Google Sheet → change it in ChatGPT → check the phone changes after scheduled or manual pull. Then send a test notification and verify the phone actually displays it with the app closed.

## Permission and risk boundaries

- Only the Firebase account with an admin-created `hqOwners/{uid}` document can invoke functions or read the private records. The Cloud Function runtime bypasses Firestore client rules, so review service-account permissions and function access carefully.
- The canonical ChatGPT record remains the private Google Sheet. Firestore is the phone's live mirror. Every conflict is flagged for review. There is **no deletion synchronization**; closing a task marks it `done`, not a destructive delete.
- The scripts do not send emails, alter immigration forms, book travel, make payments, or write to unrelated documents.
- Deadlines remain unconfirmed unless explicitly verified with authoritative sources; tasks imported from November 7 are historical, not proof of current completion.
- No notification, calendar event or agent status is evidence that a task was completed.
- Default `configureHQ` notifications are **off** unless you explicitly enable them. Quiet hours are 22:00–08:00 Toronto.

## Deployment commands (run only on your authenticated Google/Firebase project)

```bash
cd hq/backend/functions
npm ci   # if package-lock.json present; else npm install
node --test test/*.test.js
cd ..
firebase use adarsh-hq-private
firebase deploy --only firestore:rules,functions:hq
```

**Missing in current ChatGPT connection:** administrative Firebase Cloud Functions deployment capability. I can edit public GitHub code and update the existing private Google Sheet, but cannot grant myself Google Cloud IAM, billing, share service-account access, or deploy this backend without the user's authorization/integration. Do not present this package as a running background worker.