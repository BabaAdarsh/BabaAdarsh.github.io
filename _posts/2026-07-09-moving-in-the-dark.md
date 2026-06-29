---
layout: post
title: "The sense you forget you have: how the brain feels the body"
tags: [proprioception, state estimation, mind in motion]
published: false
---

<!-- Scheduled for 2026-07-09. Set published: true (or remove the line) and push to make live. -->

<div class="series-note">
<b>Mind in Motion</b>, post four. Every fast correction we discussed last time depends on one thing: the brain knowing where the limb actually is. That knowledge does not come for free. This post is about proprioception, the quiet sense that makes movement possible.
</div>

Close your eyes and touch the tip of your nose. You did it without a moment's doubt, in complete darkness, with no visual guide. Now ask how. You did not see your hand. You did not feel your way there. You simply knew where your arm was the whole time, and you knew where your nose was, and you brought them together.

That knowing is proprioception, the sense of the position and motion of your own body. It runs constantly, beneath awareness, and it is so seamless that most people do not know they have it. It is the sense you forget you have, until it is gone.

## A life without it

In the early 1970s a young man named Ian Waterman lost it. A viral illness destroyed the large sensory nerves that carry proprioception from below his neck, while leaving the nerves that move his muscles intact. He could still send commands to his body. He simply could no longer feel it.

The result was devastating in a way that reveals how much proprioception does. At first he could not sit up, could not stand, could not control his hands, despite having perfectly functioning muscles. With years of extraordinary effort he learned to move again, but only by watching every limb constantly and consciously planning motions other people never think about. Turn out the lights and he collapses. Cases like his, documented carefully by John Cole and others, show that proprioception is not a luxury sense that adds detail. It is the substrate that ordinary movement is built on (Cole and Sedgwick, 1992). Laboratory studies of people who have lost proprioception show the same thing: their reaches become clumsy, especially across multiple joints, because they can no longer account for how the segments of the arm pull on each other (Sainburg et al., 1995).

## The brain does not just listen, it predicts

Here is the twist that makes proprioception a computational story and not just an anatomical one. The signals coming from your muscles are both delayed and noisy. By the time a position signal reaches the brain, it is already tens of milliseconds out of date, and it is corrupted by noise. If the brain simply trusted the raw inflow, control would be sluggish and jittery.

So it does something cleverer. It predicts. Using an internal model of the body, the brain forecasts where the limb should be given the commands it just sent, and then combines that prediction with the delayed, noisy sensory signal to form a best estimate of the body's current state. Wolpert, Ghahramani and Jordan demonstrated this directly: people's estimate of their hand position behaves exactly as this kind of prediction-plus-correction scheme predicts, not as raw sensing would (Wolpert, Ghahramani and Jordan, 1995).

<figure>
<img src="/assets/img/blog/state_estimation.png" alt="Combining a noisy sensory signal with a prediction to estimate limb state">
<figcaption>The brain's estimate of the limb (teal) is not the raw sensory signal (gray dots), which is noisy and delayed, nor pure prediction. It is the two fused together, tracking the true state (gold) more accurately and smoothly than the senses alone. Simulated as a Kalman-style estimator, the standard model of how prediction and feedback are combined.</figcaption>
</figure>

This is why the estimate in the figure is smoother and more accurate than the jittery sensory samples it is built from. It is also, incidentally, why you cannot tickle yourself: when the brain predicts the sensory consequences of its own movements, it discounts them, so a self-generated touch feels weaker than the same touch from someone else.

## Two senses are better than one

When you can see your hand as well as feel it, the brain does not pick one source. It blends vision and proprioception, and it blends them wisely, leaning more on whichever is more reliable for the job at hand. Vision is excellent for absolute position in space; proprioception is quick and always available. Studies of how people combine the two find that the weighting shifts with reliability in close to the statistically optimal way, the same principle the brain uses when combining any two uncertain cues (Sober and Sabes, 2005; Ernst and Banks, 2002).

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>The prediction-plus-correction scheme is naturally formalized as a Kalman filter: a forward model propagates the state estimate, and incoming sensory signals correct it with a gain set by the relative reliability of prediction versus measurement. Multisensory integration then weights vision and proprioception by their inverse variances. An open and, to me, fascinating question is how the motor state itself shapes proprioceptive precision: co-contracting the muscles around a joint changes the very spindle signals the estimate depends on, so sensing and acting are not cleanly separable. That coupling between impedance and perception is part of what I study.</p>
</div>

## Why a forgotten sense deserves attention

Taking proprioception seriously reshapes several practical problems. Prosthetic limbs that only move, without giving back a sense of where they are, remain hard to control and feel like tools rather than parts of the body; adding sensory feedback is a frontier of neuroprosthetics. Rehabilitation after stroke increasingly recognizes that restoring movement may require restoring the sensing that guides it. And the deep lesson, that perceiving the body and controlling it are two halves of one loop, is why I find this corner of neuroscience so compelling.

Touch your nose again, eyes closed. The ease of it is an illusion built on a constant, hidden computation: a brain predicting its own body, correcting the guess with noisy signals from the muscles, and holding a steady sense of where you are in the dark. It is the sense you forget you have. It is also the one that makes you feel like you have a body at all.

<div class="series-note">
That closes the first arc of <b>Mind in Motion</b>: generation, preparation, correction, and sensing. The next arc turns to learning: how movement changes with practice. Subscribe via <a href="/feed.xml">RSS</a>.
</div>

## References

<div class="refs" markdown="1">
1. Wolpert, D. M., Ghahramani, Z., and Jordan, M. I. (1995). An internal model for sensorimotor integration. *Science*, 269(5232), 1880–1882.
2. Sainburg, R. L., Ghilardi, M. F., Poizner, H., and Ghez, C. (1995). Control of limb dynamics in normal subjects and patients without proprioception. *Journal of Neurophysiology*, 73(2), 820–835.
3. Cole, J. D., and Sedgwick, E. M. (1992). The perceptions of force and of movement in a man without large myelinated sensory afferents below the neck. *Journal of Physiology*, 449, 503–515.
4. Sober, S. J., and Sabes, P. N. (2005). Flexible strategies for sensory integration during motor planning. *Nature Neuroscience*, 8(4), 490–497.
5. Ernst, M. O., and Banks, M. S. (2002). Humans integrate visual and haptic information in a statistically optimal fashion. *Nature*, 415(6870), 429–433.
</div>
