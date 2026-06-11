---
layout: post
title: "Habit and flexibility: model-based and model-free learning in movement"
tags: [motor learning, reinforcement learning, model comparison]
---

There's a distinction from reinforcement learning that quietly governs a lot of human behaviour: **model-free** versus **model-based** control. It explains why you sometimes drive halfway to your old office after moving jobs — and, as my recent work shows, it shapes how we adapt our movements too.

## Two ways to be right

A **model-free** learner caches the value of actions from experience. It's fast to execute and effortless, but rigid — it keeps doing what worked before, even when the world has changed. This is habit.

A **model-based** learner maintains a model of how the world works and plans through it. It's flexible and updates quickly when conditions change, but it's computationally expensive and slow. This is deliberate, goal-directed reasoning.

Most behaviour is a mixture, and the brain arbitrates between them — leaning on whichever is more reliable in the moment.

## The imprint that lingers

In a 2025 paper in the *Journal of Neurophysiology*, we asked whether engaging one system *biases* later learning. Participants adapted to reaching errors that were either small or large. Small errors tend to recruit a model-free, implicit process; large errors recruit a model-based, strategic one.

The striking result: the initial bias **persisted**. People who first experienced small errors kept showing model-free signatures — robust aftereffects, stable reaction times — even after we switched them to large errors that would normally favour strategy. People who started with large errors stayed flexible. Inserting a washout phase to reset performance did *not* erase the imprint. The system you engage first leaves a durable mark on how you learn next.

## Why this is more than a movement curiosity

This connects motor adaptation to deep questions about habit, flexibility, and learning history that run through all of behavioural science — the same model-free/model-based tension studied in decision-making, addiction, and reward learning. Movement just happens to be an unusually clean place to measure it, with millisecond reaction times and involuntary aftereffects as readouts of which system is in charge.

Methodologically, separating these accounts is a **model comparison** problem: you fit competing computational models to each person's data and ask which one the evidence supports. That's exactly the kind of analysis I'm packaging into an open toolbox — more on that in an upcoming code post.

Next: the body itself as part of the computation — proprioception, co-contraction, and why stiffening up is sometimes the smart thing to do.
