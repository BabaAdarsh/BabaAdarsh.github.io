---
layout: post
title: "Why your brain keeps competing memories for the same movement"
tags: [motor learning, memory, computational neuroscience]
---

A tennis player switches between a flat serve and a kick serve. A driver moves between a manual and an automatic car. A patient relearns to walk after a stroke while their old gait pattern lingers. In each case, the brain holds *multiple* memories for what is nominally the same action — and somehow has to decide, moment to moment, which one to use.

This is the question that has occupied much of my research: not just how we learn movements, but how the brain manages a *library* of learned behaviours that can compete with each other.

## Learning isn't the hard part — retrieval is

In the lab, we study this with a deceptively simple task. Participants reach to targets while we rotate the visual feedback of their hand. Reach straight, and the cursor veers 30° off. Within dozens of trials, people compensate — their brain has learned a new visuomotor mapping.

Now flip the rotation to the opposite direction. People adapt again. But here's the interesting part: the two memories don't simply overwrite each other. Under the right conditions, both survive, and behaviour at any moment reflects a competition between them. Performance failures often aren't failures of *learning* at all — they're failures of *expression*: the wrong memory, or the wrong mixture of memories, got retrieved.

## Context is the key the brain uses

How does the brain decide which memory to express? Our recent work (in press at *iScience*) points to two ingredients.

The first is **contextual cues** — sensory signals that label which environment you're in. The second is subtler: **transition statistics**. The brain tracks how often the world switches between contexts and uses that history as a prior. After imbalanced training, memory expression is biased toward the more stable context; when stabilities are matched, it tilts toward the more recent one. Retrieval, in other words, is an inference problem: the brain weighs current sensory evidence against latent priors learned from the statistical structure of the environment.

This single principle turns out to explain several phenomena that have puzzled the field for decades — interference between memories, the spontaneous recovery of "lost" memories, and why variable practice produces more robust learning.

## Why this matters beyond the lab

If poor performance can reflect wrong-memory expression rather than absent learning, that changes how we should think about rehabilitation. A stroke patient who struggles may not need more repetitions of the right behaviour — they may need training that helps the nervous system *infer the right context* for it. And for machine learning, biological context-inference offers a blueprint for one of the field's stubborn problems: continual learning without catastrophic forgetting.

In future posts I'll unpack the computational models behind this work — state-space models of adaptation, Bayesian context inference, and the difference between model-based and model-free learning — and share code along the way.

*This is the first post of a weekly series on computational neuroscience, motor learning, and behavioural modelling. Thanks for reading.*
