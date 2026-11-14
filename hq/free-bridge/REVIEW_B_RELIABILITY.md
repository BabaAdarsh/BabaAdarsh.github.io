# Reliability reviewer — no misleading automation

- Never claim that Apps Script is running until the user has authorized `hqCheckConnection`, run `hqTick`, installed its time trigger, and verified a real phone ↔ Sheet change.
- Firebase Spark and Apps Script quotas apply. Scheduled 15-minute checking is best-effort and can stop on auth failures.
- Firestore REST is accessed through an OAuth token for the user linked to the existing standard Google Cloud project; user must approve the necessary scopes. No downloaded service-account keys.
- Google Sheet remains the canonical ChatGPT-side record; Firebase provides phone UI and near-live device updates, not independent AI work.
- Preserve newer phone/Sheet rows by comparing timestamps; same/invalid timestamp conflicts remain untouched, not silently merged. Progress journal is append-only.
- Error log and syncMeta health must be checked, plus actual message delivery for any email alert. No unrequested mail or notifications.
- Do not grant broad public Firestore rules or share private Sheet. Do not write Sheet IDs or user UID into GitHub source.
- Avoid overriding existing Apps Script files or scopes. Cloud project linking may require reauthorization and should be backed up before it changes.