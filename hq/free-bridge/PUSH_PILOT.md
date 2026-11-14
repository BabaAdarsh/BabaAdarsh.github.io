# Adarsh HQ — Optional Android push pilot (no email, $0 extra)

**State:** The push code is published, but it is NOT installed in your private Apps Script and no push notification has been delivered or tested on your phone. Existing Sheet ↔ Firebase synchronization is unaffected.

This is optional. Push is OFF by default. Do not enable billing or paid Cloud Functions.

## What it uses

Firebase Cloud Messaging (FCM) is free on Firebase Spark. The sender attempts to use the Google account's short-lived Apps Script OAuth token and the official FCM HTTP v1 API, without a private server key or Cloud Functions. Google documents OAuth scopes and the cloudmessaging.messages.create IAM permission; user-token authorization must be verified in this Firebase project.

Official references:
- https://firebase.google.com/docs/cloud-messaging/send/v1-api
- https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages/send
- https://firebase.google.com/docs/cloud-messaging/web/get-started
- https://firebase.google.com/pricing

## Optional one-time test (in order)

1. Leave the existing working hqTick sync and its trigger unchanged.
2. Firebase Console → adarsh-hq-private → Project settings → Cloud Messaging → Web Push certificates: generate or copy the **PUBLIC VAPID key**. Never share a private key, access token or registration token.
3. On Android HQ → Settings → **Register this phone for push (pilot)**. Paste the PUBLIC VAPID key in the prompt; allow Chrome notifications. Device registration writes a token privately to Firestore users/{uid}/devices.
4. In your existing private **Adarsh HQ Free Sync** Apps Script project, add a separate script file named HQ_Push.gs. Paste the entire source from the neighboring GitHub file. Do not overwrite Code.gs.
5. In the existing Apps Script appsscript.json manifest, append this OAuth scope while keeping every existing scope: https://www.googleapis.com/auth/firebase.messaging . Save, and review Google's reauthorization prompt.
6. Run **hqPushProbe**: it reports registered device count (never tokens). If zero, phone registration is incomplete.
7. Run **hqPushValidate**: FCM validates a request without delivering. If it fails (e.g. HTTP 403), verify Firebase Cloud Messaging API and the current Google account's cloudmessaging.messages.create permission. Do not enable Blaze, download service-account JSON or make anything public. Stop if owner OAuth is unsupported.
8. Run **hqPushTest** only when ready for one actual generic push; put HQ in the background. A successful FCM acceptance response is NOT proof of Android delivery—check the real device.
9. **Only if you want daily pushes after the real test**, set private Script Property HQ_PUSH_ENABLED=true and run hqInstallPushTrigger. This installs a *separate* 15-minute trigger that sends **at most one generic reminder in the 9–10 AM Toronto window** per day. Optional evening 7–8 PM reminders require HQ_PUSH_EVENING=true; default OFF.
10. To stop push without affecting existing sync, run hqRemovePushTrigger or set HQ_PUSH_ENABLED=false.

## Safety and limits

- **No emails**. Keep HQ_EMAIL_REMINDERS=false.
- Generic lock-screen text protects private research, immigration, money, family and health information.
- FCM device registration tokens stay in the private Firestore devices collection. OAuth and registration tokens are never logged or published.
- Apps Script triggers are approximate, not exact alarms. Browser permissions, battery, network, token validity and quotas affect delivery.
- The distinctions matter: configured ≠ FCM validation succeeded ≠ FCM send accepted ≠ phone notification actually received.
- No second AI, paid service or hidden background model is involved.
