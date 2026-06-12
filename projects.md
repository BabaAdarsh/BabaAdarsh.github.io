---
layout: default
title: Projects
permalink: /projects/
---

# Code &amp; Projects

Open-source toolboxes spanning my research program — from behavioural experiments and computational models to neural decoding and population dynamics. Everything is tested, documented, MIT-licensed, and on <a href="https://github.com/BabaAdarsh">GitHub</a>.

Together they form one pipeline: **collect** behaviour → **model** learning → **measure** physiology and movement quality → **decode** neural activity → **model** neural dynamics.

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/reach-task">reach-task</a></h3>
<p>A dependency-free, browser-based framework for sensorimotor adaptation experiments — visuomotor rotation, task-irrelevant error-clamp (implicit adaptation), target jump, and mirror reversal. Runs free on GitHub Pages and scales to web/tablet data collection. <em>JavaScript · 22 tests.</em> <a href="https://babaadarsh.github.io/reach-task/">Live demo →</a></p>
<img src="/assets/img/projects/reach-task.png" alt="reach-task: adaptation to a visuomotor rotation">
</div>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/motor-adaptation-models">motor-adaptation-models</a></h3>
<p>Canonical state-space models of sensorimotor learning — single-rate, dual-rate (Smith et al. 2006), and memory-of-errors (Herzfeld et al. 2014) — with fitting and AIC model comparison. Reproduces savings, interference, and spontaneous recovery. <em>Python · 12 tests.</em></p>
<img src="/assets/img/projects/motor-adaptation-models.png" alt="Spontaneous recovery from the dual-rate model">
</div>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/emg-pipeline">emg-pipeline</a></h3>
<p>Surface-EMG processing for movement neuroscience: filtering, envelopes, co-contraction indices, and NMF muscle-synergy extraction. Built around interpretable physiological readouts. <em>Python · 16 tests.</em></p>
<img src="/assets/img/projects/emg-pipeline.png" alt="EMG pipeline and co-contraction">
</div>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/kinematics-features">kinematics-features</a></h3>
<p>Interpretable movement biomarkers from reach trajectories — SPARC smoothness, submovements, straightness, and trial-to-trial variability. The markers that distinguish healthy from impaired movement. <em>Python · 12 tests.</em></p>
<img src="/assets/img/projects/kinematics-features.png" alt="Smooth vs fragmented reach features">
</div>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/neural-decoding-kit">neural-decoding-kit</a></h3>
<p>Decode arm movement from motor-cortical population activity — the core problem of intracortical BCIs. Population-vector, Wiener, and Kalman (Wu et al. 2006) decoders, all from scratch in NumPy. <em>Python · 6 tests.</em></p>
<img src="/assets/img/projects/neural-decoding-kit.png" alt="Decoded vs true reaches and decoder accuracy">
</div>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/task-trained-rnn">task-trained-rnn</a></h3>
<p>A recurrent network trained (from-scratch backprop-through-time) to perform center-out reaching develops the rotational population dynamics found in motor cortex (Churchland et al. 2012). Includes a jPCA implementation. <em>Python · 9 tests.</em></p>
<img src="/assets/img/projects/task-trained-rnn.png" alt="RNN training, reaches, and emergent rotational dynamics">
</div>

<h2>Research program</h2>

<div class="card">
<h3><a href="https://github.com/BabaAdarsh/motornet-experiments">motornet-experiments</a> — Embodied Control Under Uncertainty</h3>
<p>A pre-registered program of three novel experiments in <a href="https://elifesciences.org/articles/88591">MotorNet</a> (Codol et al., 2024): emergent impedance/co-contraction under uncertainty, reliability-weighted multisensory feedback control, and competing memories &amp; contextual inference in an embodied controller. Detailed designs, runnable training scripts, and a tested analysis layer. <em>Python · 13 tests.</em></p>
<img src="/assets/img/projects/motornet-experiments.png" alt="MotorNet experiment program schematic">
</div>

<p style="margin-top:1.5rem"><a href="https://github.com/BabaAdarsh">See all repositories on GitHub →</a></p>
