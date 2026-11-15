# HQ v19 beta — testing before production promotion

Existing stable PWA: https://babaadarsh.github.io/hq/

Beta test link (once released): https://babaadarsh.github.io/hq/beta.html

The beta should show **Pick up where you stopped** on Today after starting a 20-minute mission. On the same or another signed-in device, the bookmark is saved to existing Firebase `jobs` and mirrored into `HQ Jobs` automatically. Only simple *user focus checkpoints* are stored; ChatGPT doesn't silently execute in the background.

## Three-minute user check
1. On Android, open the beta, sign in to the same Google account and confirm existing missions and progress still display.
2. Tap **Start 20 minutes** on one mission. It should open a copy/paste handoff to ChatGPT and show a resumable bookmark.
3. Tap **Save my place**, optionally enter one sentence, and return to Today. Tap **Resume**.
4. Tap **Review outcome** only if you actually did something; it must **not** mark the mission Done.
5. Check the same bookmark on laptop in beta. Then open the stable /hq/ app and verify it still works.

Do not upload/submit sensitive documents for testing. If the beta malfunctions, continue using stable HQ unchanged. This release is explicitly a preview until user-confirmed acceptance.
