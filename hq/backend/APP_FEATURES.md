# Adarsh HQ v1.0 — app integration features (deploy-aware)

The published Android app receives extra optional controls in Settings:

- **Check background connection** — calls the authenticated `connectionHealth` Cloud Function and shows its real status, or clearly says that the backend is not deployed.
- **Activate automatic sync** — only after the user has read and authorized the intended backend and shared their private Google HQ Sheet with its trusted service identity. Calls `configureHQ` and reports whether the service has access.
- **Pull latest now** — calls `syncNow` with a 60-second server-side rate limit, then receives changes through Firestore listeners. This does not call a second AI.
- **Send test push** — invokes a private Cloud Function; a successful FCM response is an accepted send, not a confirmed device receipt.

The code also fixes a misleading queued-task label by distinguishing `saved` from `executing`, attaches `syncOrigin:'phone'` and a revision timestamp to phone changes, and adds a single next-action emphasis on Today.

**No backend deployment is implied.** The existing user-authorized Google HQ import continues to work in the meantime.