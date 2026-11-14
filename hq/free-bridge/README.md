# Adarsh HQ — $0 extra-cost sync bridge (v1.6)

**Status:** complete source, 15 local simulated tests passed. **Not installed or verified on the user's Google account.** This is **not** a second AI and does not require Firebase Blaze, Firebase Cloud Functions, an AI API key, or a paid hosting plan.

## What it does, once installed

- Every ~15 minutes, a **Google Apps Script time trigger**, owned and authorized by the user's Google account, compares three tabs in the private HQ Sheet (`Missions`, `HQ Jobs`, `Project Updates`) with the user's private Firebase Firestore collections. It imports changes both ways, using timestamps to protect newer edits, preserving conflicting values for human review, and treating the progress journal as append-only.
- Publishes a private `users/{uid}/syncMeta/current` health record. The Android app already has a listener for this record, which displays the actual last successful backend check.
- The private **Google HQ Sheet remains the ChatGPT-side source**; the Firebase PWA is the live phone companion. A phone job becomes readable by ChatGPT **after the next successful trigger**; saving a job is not instantaneous ChatGPT execution.
- **No reminder emails:** the user prefers phone engagement. Keep HQ_EMAIL_REMINDERS=false. An optional no-cost FCM Android push pilot has been prepared separately but remains disabled until actual phone testing.
- Requests no paid services, no service-account keys, no broad Gmail inbox access, and stores no private user data or tokens in a public repository. Script properties are set privately in your own Apps Script account.

## One-time setup — use your private HQ Sheet, not a new dashboard

1. Open the private **Adarsh HQ — Mission Database** Google Sheet while signed into the account that owns your Firebase project. Choose **Extensions → Apps Script**. If this already has working files, **do not delete or overwrite them**; add a new file named `HQ_FreeBridge` and paste all of `Code.gs` into it. Function names start with `hq` to avoid collisions.
2. In Apps Script → **Project Settings**: enable **Show `appsscript.json` manifest file in editor**. Open that manifest. Preserve any existing necessary settings/scopes. Add the permissions from the bundled `appsscript.json` (`spreadsheets.currentonly`, `datastore`, `script.external_request`, `script.scriptapp`, `script.send_mail`); do not casually delete other existing OAuth scopes that an older script needs.
3. The key step: under **Google Cloud Platform (GCP) Project**, link this Apps Script to the **existing standard Firebase Google Cloud project** `adarsh-hq-private`, **project number `660024483095`**. This is NOT an upgrade to Blaze, billing, or a new project. Linking may require project owner permissions and Google OAuth consent settings. Apps Script and Firebase must use the same Cloud project so `ScriptApp.getOAuthToken()` with the `datastore` scope can authorize Firestore REST requests. See the official Google Apps Script Cloud project docs. If the project cannot be linked, **stop** and leave the working phone app as it is.
4. In Firebase Console → **Authentication → Users**, find the UID for the Google account already signed into HQ. You do **not** need to share your UID here. In Apps Script → Project Settings → **Script properties**, add `FIREBASE_UID` = your exact UID. Do not put it in public code.
5. Keep HQ_EMAIL_REMINDERS=false (or unset). Do not configure HQ_SELF_EMAIL. The user explicitly does not want email reminders.
6. In Apps Script, choose function **`hqCheckConnection`** and click Run. Complete Google's authorization. It should return `ok: true`. If it reports HTTP 403, verify you selected the correct project/account and that the Firestore API and IAM permissions are sufficient. **Do not enable billing**, do not make Firestore or the Google Sheet public, and do not download service-account credentials to fix permissions.
7. Run **`hqTick`** once manually. Review Execution logs. Verify one existing mission and progress entry appear on the phone. Check `hqStatus` to inspect the result. We should then create a **harmless test mission**, change its status on the phone, and confirm it arrives in the Google Sheet without overwriting other rows.
8. Only after this manual test succeeds, run **`hqInstallFreeTriggers`** once. It creates one 15-minute time-driven trigger owned by you. Trigger timing is approximate, not guaranteed exact. You can stop it any time with **`hqRemoveFreeTriggers`**. Apps Script has free usage quotas; check Executions to see real errors.
9. No email reminder setup is needed. If the user later chooses genuine Android push, see PUSH_PILOT.md; it is separate, optional, off by default and does not alter the working sync trigger.

**No separate App Script web app deployment is necessary** for this scheduled bridge. The existing Android PWA URL remains `https://babaadarsh.github.io/hq/`.

## What this does NOT do

- It does **not** read/monitor every message from other ChatGPT conversations by itself. ChatGPT still needs to record significant work in the private HQ Sheet during our sessions.
- It does **not** remotely wake up a ChatGPT conversation. The existing ChatGPT scheduled task may read the queue, but that behavior must be tested separately.
- It does **not** have verified Android push delivery yet. The optional FCM sender is documented in PUSH_PILOT.md and stays OFF until user approval and an observed phone test. Email is not the fallback.
- It does **not** have a tested live production connection yet. Local tests mock Firestore and Sheets interactions; expect possible OAuth/IAM issues before activation.
- It does **not** move or modify unrelated Google Drive files, user calendar events, immigration applications, or mail inbox messages.

## Production safeguards

- `ScriptApp.getOAuthToken()` is generated at runtime and **never persisted or logged**. Do not paste an OAuth token into chat.
- Public GitHub files contain only source; no Sheet ID, UID, emails, or credentials.
- If both phone and Sheet differ with the same/unparseable timestamp, **neither wins**; the script records a conflict in logs, for manual review.
- The Apps Script linked standard GCP project change can trigger reauthorization of older scripts; preserve the original configuration and make a copy of any existing work before changing the project.
- Don't click any upgrade/billing instructions. This design is expressly for Firebase Spark and Google's standard free Apps Script allowances.