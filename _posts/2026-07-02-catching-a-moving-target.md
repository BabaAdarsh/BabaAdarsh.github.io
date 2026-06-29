---
layout: post
title: "The smart reflex: how your arm fixes a reach already in motion"
tags: [feedback control, motor cortex, mind in motion]
published: false
---

<!-- Scheduled for 2026-07-02. Set published: true (or remove the line) and push to make live. -->

<div class="series-note">
<b>Mind in Motion</b>, post three. We have looked at how movement is generated and how it is prepared. But a plan made before you move meets a world that refuses to hold still. This post is about what happens after you have already started, when the target moves.
</div>

Pour yourself a glass of water and, halfway through reaching for it, have a friend slide the glass a few centimeters to the side. Your hand will follow. It will curve smoothly onto the new location without a hitch, and it will start doing so faster than you can say the word "move," often before you are even aware the glass shifted at all.

That correction is one of the most underrated feats your nervous system performs. The movement was already underway, the command supposedly sent, and yet the system caught a change in the world and rewrote the action on the fly. How it does this turns out to say something deep about what the motor system fundamentally is.

## Three ways to react, fast to smart

When something disturbs your moving arm, the response arrives in waves.

The quickest is the spinal stretch reflex, around 25 milliseconds. It is fast because it is simple: a muscle is stretched, a loop through the spinal cord tells it to push back. It is also, on its own, fairly dumb. It resists the stretch regardless of whether resisting helps you.

Then, around 50 to 100 milliseconds, comes the interesting one: the long-latency response. It is still far faster than a deliberate decision, but it is not dumb. It takes the goal of your task into account. If you are knocked in a direction that does not matter for what you are trying to do, it barely bothers. If the same knock threatens the goal, it pushes back hard. The same physical disturbance produces different responses depending on what you are trying to achieve.

That goal-sensitivity is the signature of something computing, not just reflexing. And a major reason the long-latency response is smart is that it travels through cortex. Pruszynski and colleagues showed that primary motor cortex participates in this rapid response and that it does real work: it integrates information across joints to account for the mechanics of the limb, the kind of computation a pure spinal reflex cannot do (Pruszynski et al., 2011). The "reflex" is partly a cortical feedback controller running at reflex speed.

## A controller, not a script

The cleanest way to make sense of all this is to stop thinking of movement as a script that is written, sent, and executed, and start thinking of it as feedback control.

The influential framework here is optimal feedback control (Todorov and Jordan, 2002; Scott, 2004). Instead of pre-computing a perfect trajectory and running it blindly, the nervous system holds a goal and continuously turns incoming sensory information into corrections that serve that goal. Crucially, it does not fix everything. It follows what is sometimes called a minimal intervention principle: correct the deviations that matter for the task, and leave the rest alone. That is why your handwriting is recognizably yours even though no two strokes are identical, and why the long-latency response ignores task-irrelevant pushes. Variability that does not threaten the goal is simply not worth the effort to suppress.

You can see the logic in a simple simulation of a feedback controller reaching to a target that jumps mid-movement, exactly the glass-of-water experiment that has been done many times in the lab (for example, Day and Lyon, 2000).

<figure>
<img src="/assets/img/blog/feedback.png" alt="A feedback-controlled reach correcting to a target that jumps mid-movement">
<figcaption>Left: a reach to a target that jumps sideways partway through. The controller does not stop and restart; it curves smoothly onto the new target. Right: the hand-speed profile gains a second, smaller peak, the corrective submovement, time-locked to the jump. Simulated with a simple feedback controller; the same signatures appear in human reaching.</figcaption>
</figure>

The second bump in the speed profile is the fingerprint of online correction. The movement was not replanned from scratch; an ongoing controller folded the new information into the action already in progress.

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>Optimal feedback control frames the problem as choosing feedback gains that minimize a cost (error plus effort) given the limb dynamics, sensory and motor noise, and crucially the delays. Because feedback is delayed by tens of milliseconds, good control depends on state estimation: the brain predicts the current state of the limb with a forward model and corrects that prediction with delayed sensory inflow, much like a Kalman filter (a theme for a later post). Feedback gains are not fixed; they are tuned to the task and even modulated within a movement, which is why the long-latency response is task-dependent (Pruszynski and Scott, 2012; Scott, 2016).</p>
</div>

## Why the smart reflex matters

Reframing the motor system as a controller rather than a script-player changes a lot.

It dissolves the old puzzle of how movements can be both stereotyped and flexible: they are stereotyped where it matters and free where it does not. It tells roboticists that robust movement comes from good feedback policies, not perfect plans. And it reshapes how we think about recovery from injury, because it asks not only whether someone can issue a command but whether their feedback loops, their ability to sense a deviation and correct it intelligently, are intact. In my own work on how we sense limb position and stiffen against disturbances, these fast feedback loops are exactly where perception and action meet.

So the next time a glass slips and your hand chases it without thought, notice what just happened. A loop running below awareness, faster than decision but smarter than reflex, quietly rewrote your movement to keep the goal. Your arm was never following a script. It was being steered.

<div class="series-note">
Next in <b>Mind in Motion</b>: all of this fast correction depends on knowing where your limb actually is. How does the brain sense the body, and why can you still move in the dark? Subscribe via <a href="/feed.xml">RSS</a>.
</div>

## References

<div class="refs" markdown="1">
1. Todorov, E., and Jordan, M. I. (2002). Optimal feedback control as a theory of motor coordination. *Nature Neuroscience*, 5(11), 1226–1235.
2. Scott, S. H. (2004). Optimal feedback control and the neural basis of volitional motor control. *Nature Reviews Neuroscience*, 5(7), 532–546.
3. Pruszynski, J. A., Kurtzer, I., Nashed, J. Y., Omrani, M., Brouwer, B., and Scott, S. H. (2011). Primary motor cortex underlies multi-joint integration for fast feedback control. *Nature*, 478(7369), 387–390.
4. Pruszynski, J. A., and Scott, S. H. (2012). Optimal feedback control and the long-latency stretch response. *Experimental Brain Research*, 218(3), 341–359.
5. Day, B. L., and Lyon, I. N. (2000). Voluntary modification of automatic arm movements evoked by motion of a visual target. *Experimental Brain Research*, 130(2), 159–168.
6. Scott, S. H. (2016). A functional taxonomy of bottom-up sensory feedback processing for motor actions. *Trends in Neurosciences*, 39(8), 512–526.
</div>
