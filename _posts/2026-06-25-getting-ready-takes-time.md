---
layout: post
title: "Getting set: why your brain needs a head start to move"
tags: [motor preparation, neural dynamics, mind in motion]
---

<div class="series-note">
<b>Mind in Motion</b>, post two. Last time we saw that motor cortex behaves less like a keyboard and more like an engine whose state rotates. If that is right, then before you move, something has to wind the engine up. This post is about that winding, and why it costs time.
</div>

Watch a sprinter in the blocks. The starter calls "set," and the runner freezes in a crouch, utterly still, yet you can feel that something has changed. They are not moving, but they are loaded. When the gun fires, the explosion is immediate. The stillness was not idleness. It was preparation.

Your brain does the same thing before every reach, on a scale of milliseconds. Flash a target, and you do not move instantly. Two to three tenths of a second pass before your hand leaves the start, a delay we call reaction time. That pause is not the signal traveling slowly down your arm. Most of it is something happening in cortex first. The question is what, and why it cannot be skipped.

## The pause is not wasted

For a long time the natural reading of reaction time was that the brain is busy *computing the command*: working out which muscles, how hard, in what order. On the keyboard picture from the last post, that makes sense. Spelling out a complicated instruction takes time.

But the dynamical-systems view suggests something different and, to me, more satisfying. If movement is produced by letting a set of internal dynamics run from some starting state, then preparation is simply the act of getting the population to the right starting state. Reaction time is the time it takes to wind the engine to the correct point before releasing it.

This is not just a metaphor swap. It makes a sharp, testable prediction. If preparation is reaching a good initial state, then on trials where the brain happens to get there faster, the movement should start sooner.

That is exactly what is found. Recording from premotor cortex while monkeys made reaches, Afshar and colleagues showed that the moment-to-moment neural state predicts reaction time on individual trials: when the population is already near its ideal launch state, the reach begins sooner; when it is further away, the movement waits (Afshar et al., 2011). The "getting ready" is visible in the neural data as a trajectory toward a target state, and crossing into that state is what lets movement begin. This idea, that movement waits until the population reaches a good launching zone, is often called the optimal subspace hypothesis (Churchland et al., 2010).

<figure>
<img src="/assets/img/blog/preparation.png" alt="Different prepared initial states produce different movements under the same dynamics">
<figcaption>The same engine, different starting points. Left: a rotational dynamical system run from several prepared initial states (dots). Right: a fixed read-out of that activity produces a different muscle-command time course for each starting state. Preparation chooses the starting point; the dynamics do the rest. Simulated from a linear rotational system.</figcaption>
</figure>

A telling detail supports this. If preparatory activity were just a faint preview of the movement command, then a neuron active during a rightward reach should be mildly active while preparing a rightward reach. But when Churchland and colleagues looked, single-neuron preparatory tuning was only weakly related to movement tuning (Churchland et al., 2010). Preparation does not look like a quiet rehearsal of the movement. It looks like setting up something whose relationship to the movement is indirect, exactly what "choosing an initial condition" would predict.

## Revving the engine in neutral

This raises an obvious problem. If preparation is loading the very machinery that produces movement, why does preparing not make you move? The sprinter in the "set" position is full of motor preparation, yet perfectly still.

The answer is one of my favorite results in the field. Kaufman and colleagues found that the large changes in motor cortex during preparation are arranged so that they cancel out at the level of the muscle read-out (Kaufman et al., 2014). The activity lives in what they called an output-null subspace: directions of population change that the downstream muscles are, in effect, blind to. The engine revs, but in neutral. Only when a trigger shifts that activity into the output-potent directions does the movement fire.

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>"Output-null" and "output-potent" refer to subspaces of population activity defined relative to a read-out: changes within the null space do not project onto the muscle output, changes in the potent space do. Preparatory variance is concentrated in the null space, which is how preparation can be large yet silent. A separate, condition-independent signal around movement onset (Kaufman et al., 2016) may act as the trigger that ushers activity into the potent space. The clutch analogy is imperfect but useful: the engine is running the whole time; engagement is what couples it to the wheels.</p>
</div>

## Why this is worth caring about

Seeing preparation as setting an initial state, hidden in a null space until release, pays off well beyond elegance.

It tells us that intention is legible before action. Brain-machine interfaces can read the prepared state and know where someone intends to reach before the reach happens, which is part of why modern intracortical interfaces feel responsive rather than laggy. It reframes reaction time as a property of neural geometry rather than a stopwatch on a computation. And it offers a language for disorders of starting to move: the difficulty initiating movement in Parkinson's disease, for instance, looks different when you ask whether the engine can be set and released rather than only whether the muscles can act.

The sprinter in the blocks is not waiting. They are holding a wound engine in neutral, everything loaded, poised on the edge of the potent space, so that when the gun fires there is nothing left to compute. The head start happened in the stillness.

<div class="series-note">
Next in <b>Mind in Motion</b>: once a movement is underway, the world does not hold still. How does the brain catch a target that moves after you have already started reaching? Subscribe via <a href="/feed.xml">RSS</a>.
</div>

## References

<div class="refs" markdown="1">
1. Afshar, A., Santhanam, G., Yu, B. M., Ryu, S. I., Sahani, M., and Shenoy, K. V. (2011). Single-trial neural correlates of arm movement preparation. *Neuron*, 71(3), 555–564.
2. Churchland, M. M., Cunningham, J. P., Kaufman, M. T., Ryu, S. I., and Shenoy, K. V. (2010). Cortical preparatory activity: representation of movement or first cog in a dynamical machine? *Neuron*, 68(3), 387–400.
3. Kaufman, M. T., Churchland, M. M., Ryu, S. I., and Shenoy, K. V. (2014). Cortical activity in the null space: permitting preparation without movement. *Nature Neuroscience*, 17, 440–448.
4. Kaufman, M. T., Seely, J. S., Sussillo, D., Ryu, S. I., Shenoy, K. V., and Churchland, M. M. (2016). The largest response component in the motor cortex reflects movement timing but not movement type. *eNeuro*, 3(4).
5. Shenoy, K. V., Sahani, M., and Churchland, M. M. (2013). Cortical control of arm movements: a dynamical systems perspective. *Annual Review of Neuroscience*, 36, 337–359.
</div>
