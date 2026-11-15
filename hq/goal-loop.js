/* Adarsh HQ goal loop v1 — pure, backwards-compatible, no network or AI calls. */
(function (root) {
  'use strict';
  const SOURCE = 'hq-focus-v1';
  const OPEN = new Set(['focus_active', 'focus_paused']);
  const VALID = new Set(['focus_active', 'focus_paused', 'focus_review']);

  function stamp(value) {
    const n = Date.parse(String(value || ''));
    return Number.isFinite(n) ? n : 0;
  }
  function belongs(job) {
    return !!job && job.source === SOURCE && typeof job.jobId === 'string';
  }
  function openSessions(jobs) {
    return (Array.isArray(jobs) ? jobs : [])
      .filter(j => belongs(j) && OPEN.has(j.status))
      .sort((a,b) => stamp(b.lastUpdated || b.createdAt) - stamp(a.lastUpdated || a.createdAt));
  }
  function activeSession(jobs) {
    return openSessions(jobs)[0] || null;
  }
  function forMission(jobs, missionId) {
    return openSessions(jobs).find(j => j.missionId === missionId) || null;
  }
  function makeSession(mission, mode, at, id) {
    if (!mission || !mission.id || !mission.title) throw Error('Select a valid mission.');
    const when = String(at || new Date().toISOString());
    if (!Number.isFinite(Date.parse(when))) throw Error('Invalid focus timestamp.');
    return {
      jobId: String(id || ('FOCUS-' + Date.now())),
      createdAt: when,
      lastUpdated: when,
      missionId: String(mission.id),
      project: String(mission.title),
      request: 'User focus bookmark for mission ' + String(mission.id) + '. Not an automatically executing ChatGPT job.',
      mode: mode === 'guide' ? 'guide' : 'execute',
      priority: Math.min(10, Math.max(1, Number(mission.priority) || 5)),
      status: 'focus_active',
      organizer: 'user_focus',
      lanesJSON: '[]',
      plan: String(mission.nextAction || mission.outcome || 'Verify the next useful step.').slice(0,1500),
      resultSummary: '',
      resultLinksJSON: '[]',
      approvalState: 'not_required',
      lastChecked: '',
      version: '1',
      source: SOURCE
    };
  }
  function transition(session, status, at, note) {
    if (!belongs(session) || !VALID.has(status)) throw Error('Unknown focus bookmark or status.');
    const time = String(at || new Date().toISOString());
    if (!Number.isFinite(Date.parse(time))) throw Error('Invalid focus timestamp.');
    const msg = String(note || '').trim().slice(0,1500);
    if (status === 'focus_review' && !msg && !session.resultSummary) throw Error('Record what changed before requesting review.');
    return {
      ...session, status, lastUpdated: time,
      resultSummary: msg || String(session.resultSummary || '')
    };
  }
  function needsVerification(mission) {
    return !mission || mission.state === 'review' || !mission.nextAction;
  }
  // Never treat a focus session as evidence that a mission is complete.
  function visibleQueue(jobs) {
    return (Array.isArray(jobs) ? jobs : []).filter(j => !belongs(j));
  }
  root.HQ_GOAL_LOOP = Object.freeze({
    SOURCE, belongs, openSessions, activeSession, forMission,
    makeSession, transition, needsVerification, visibleQueue
  });
})(globalThis);
