---
layout: post
title: "The two speeds of learning a movement"
tags: [motor learning, computational models, state-space]
---

Watch someone adapt to a perturbation — say, reaching while a force pushes their arm sideways — and you see a smooth curve: error falls, then plateaus. It looks like one process. It isn't.

A landmark 2006 paper by Smith, Ghazizadeh, and Shadmehr showed that this single curve hides **two** learning processes running in parallel: a *fast* process that learns quickly but forgets quickly, and a *slow* process that learns gradually but holds on. This "two-state" model is one of the most useful ideas in all of motor learning, and it's worth understanding why.

## One equation, two timescales

Each process updates the same way after every movement: it learns a bit from the current error and forgets a bit of what it knew. In words:

> new estimate = (retention × old estimate) + (learning rate × error)

The fast process has a low retention factor and a high learning rate. The slow process is the opposite — high retention, low learning rate. Your actual behaviour on any trial is just the sum of the two.

That's it. Two lines of arithmetic, repeated trial by trial. Yet this tiny model explains a startling range of phenomena that a single-process model cannot.

## What it explains for free

**Savings** — relearning is faster the second time. The slow process retained something even after behaviour looked fully washed out.

**Spontaneous recovery** — after you adapt to A, then briefly to the opposite B until behaviour returns to baseline, a "lost" memory of A re-emerges if you simply wait. The fast process flipped to cancel A, but the slow process still quietly holds A; remove the perturbation and the slow process wins.

**Anterograde interference** — learning B is harder right after learning A. The slow process is still committed to A and resists.

None of these need extra assumptions. They fall out of the interaction between two timescales.

## Why I keep coming back to it

The two-state model is the conceptual ancestor of much of my own work. When I study *competing* motor memories — how the brain holds A and B at once and decides which to express — I'm essentially asking what happens when you give the slow process more structure: multiple latent states, context labels, and inference over which one applies. The two-state model is the simplest member of that family, and a perfect place to start.

In the next code-focused post, I'll fit this model to data in a few dozen lines of Python — part of a small toolbox I'm building. The point of these models isn't mathematical decoration; it's that fitting them to individual learning curves tells you *which* process is impaired or enhanced in a given person, which a raw error curve never could.
