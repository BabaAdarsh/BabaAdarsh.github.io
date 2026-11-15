# Adarsh HQ release contract — no downgrade

This project is governed by **Adarsh's AI Chief of Staff Charter (Nov 7, 2026)**. The product's goal is meaningful results with evidence, not another task log.

## Stable release baseline (before v19)
Git commit: `d687acbe6b816d4b7a99179977468eab3afd7fd0`.
Working system: `/hq/` GitHub Pages PWA, private Firebase Google sign-in and real-time Firestore mission/job/progress listeners, local-first cache/JSON backup-import, Apps Script `hqTick` free 15-minute Sheet↔Firestore bridge, progress journal, mission editor, explicit ChatGPT handoff, Do It For Me/Guide Me, quiet default with no email reminders. Never silently discard any of these.

## Never regress
- Preserve URLs, browser localStorage key `adarsh-hq-pwa-v06`, existing Google Sheet tabs and fields, Firestore paths, service-worker offline shell and private authentication.
- Preserve source of truth: verified Google HQ records; never replace a newer record with old phone data. Do not treat a local focus bookmark as a completed mission.
- Never store user immigration, health, unpublished research or other private data in public GitHub, analytics, browser Cache Storage, or unauthenticated scripts.
- Do not deploy Firebase Blaze, paid APIs, separate AI subscriptions, email reminders, or Cloud Functions.
- Changes to work status or actual submissions require evidence and user approval.
- No claim of working push without physically confirmed phone receipt.
- Protect freeze decisions for research data; no uncontrolled modifications.

## New focus feature (v19 beta)
The optional `goal-loop.js` helper saves a private *user focus bookmark* inside the existing HQ Jobs collection. Statuses `focus_active`, `focus_paused`, and `focus_review` are deliberately separate from ChatGPT queued or automatically executing jobs. The private 15-minute sync mirrors them through existing `HQ Jobs` fields. No database schema migration, no new Firebase permission or subscription. Completing a 20-minute session only requests review; it never marks the underlying mission done.

## Release gates
1. Node syntax and `node --test hq/tests/*.test.cjs` pass.
2. Verify cloud sync, Google auth, local backup/export, old missions, jobs, journals, two work modes and offline shell are retained.
3. Test in a **beta preview**, not by replacing the live `/hq/` first. Check signing in on phone, existing records, first bookmark, pause/resume on second signed-in device, and explicit ChatGPT handoff.
4. Check a 15-minute Apps Script trigger succeeds and no journal/missions disappear or duplicate.
5. Promote into the live app only after real-device acceptance. Keep a Git revert path and a device JSON backup. Any production release must document tests and known limitations.

## Rollback
The production app currently remains on the stable GitHub Pages `/hq/` path. If a future release misbehaves, revert its production app + `sw.js` commit to the last verified release, preserving user data and existing Google Sheet/Firestore records. Avoid reverting user-created data. Old URL stays stable.

## Workstream roles
- Chief of Staff coordinator: choose goals and measure actual outcome.
- Goal-loop engineering: bookmark/resume/action handoff.
- Trust/auditor: no downgrade, preservation and conflict guards.
- Behavioral experience: one next step, no shame or maintenance burden.

These are coordinated workstreams performed with accessible ChatGPT tools, not four permanently running independent AI models.
