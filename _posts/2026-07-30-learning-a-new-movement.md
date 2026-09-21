---
layout: post
title: "The invisible rewrite: how your brain learns a new movement"
tags: [motor learning, cerebellum, internal models, mind in motion]
---

<div class="series-note">
<b>Mind in Motion</b>, post five, and the start of a new arc on learning. So far we have treated the moving brain as a fixed machine. But the machine rewrites itself, constantly and mostly without your knowledge. This post is about that quiet rewriting.
</div>

Put on a friend's strong glasses and try to pour a glass of water. The stream lands to the side, the world seems shifted, your hand goes to the wrong place. Now keep going for a minute. Something remarkable happens: your reaches drift back on target, the wrongness fades, and pouring starts to feel normal again. You did not think your way out of it. Your brain simply recalibrated, silently, underneath your awareness.

This everyday magic is sensorimotor adaptation, and it is one of the most revealing windows we have into how the brain learns. It shows that skilled movement rests on an internal model of your body and the world, a model the brain keeps quietly up to date.

## The experiment in a sentence

Strip the glasses down to their essence and you get the workhorse task of the field. A person reaches to targets while looking at a cursor that stands in for their hand. Partway through, the experimenter rotates the cursor, say thirty degrees, so aiming straight sends the cursor off to the side. At first, people miss by thirty degrees. Over the next dozens of reaches, they gradually compensate, curving their movements the other way until the cursor lands on target again.

<figure>
<img src="/assets/img/blog/adaptation.png" alt="Adaptation to a visuomotor rotation, with an after-effect on washout">
<figcaption>A simulated learner adapting to a thirty-degree rotation. Error jumps when the perturbation appears, then falls to near zero as the brain compensates. When the rotation is switched off (washout), the hand flies off the other way: the after-effect. Generated from a standard state-space learning model.</figcaption>
</figure>

The interesting part is not that people fix the error. It is what happens when you take the rotation away. They do not simply snap back to normal. They miss in the opposite direction, and only gradually return to baseline. That opposite miss, the after-effect, is the fingerprint of real learning. It proves the brain did not just consciously nudge each reach; it changed an internal model, and that changed model persists even when it is suddenly wrong.

## Learning from a prediction that fails

Where does the correction come from? The key idea is that the brain does not learn from the raw error alone. It learns from a broken prediction.

Every time you move, your brain predicts what you should see and feel as a result, using an internal, or forward, model of how your commands turn into consequences. When the cursor is rotated, the actual visual outcome no longer matches the prediction. That mismatch, called a sensory prediction error, is the teaching signal. It tells the brain that its model of the world is slightly wrong, and it drives a small update so the next prediction is a little better.

<figure>
<img src="/assets/img/blog/internal_model.png" alt="A forward model predicts sensory feedback, and the prediction error updates the model">
<figcaption>The loop behind adaptation. A copy of the motor command feeds a forward model that predicts the sensory feedback. The prediction is compared with what actually happened, and the mismatch updates the model. Learning is driven by surprise, not just by error.</figcaption>
</figure>

This was shown beautifully in force-field experiments by Shadmehr and Mussa-Ivaldi, where people reached while a robot pushed on their arm. They learned to predict and cancel the push, and when the force was removed they pushed the wrong way, exactly as if they had built an internal model of the robot (Shadmehr and Mussa-Ivaldi, 1994). And crucially, adaptation is driven by the sensory prediction error specifically: even when people are told to aim off target so that they succeed, their reaches still drift, pulled by the mismatch they cannot consciously override (Tseng et al., 2007).

## The little brain that keeps the model honest

If learning runs on prediction errors, some part of the brain must compute them. A leading candidate is the cerebellum, the dense, folded structure tucked under the back of the brain that holds more neurons than everywhere else combined.

People with cerebellar damage show the tell precisely where the theory predicts. They can still move, and they can still use deliberate strategies, but their implicit, error-driven recalibration is impaired: they adapt poorly to rotations and force fields and show reduced after-effects (Tseng et al., 2007; Martin et al., 1996). The cerebellum looks like the brain's prediction machine, comparing what was expected with what happened and nudging the internal model toward accuracy, over and over, below the level of awareness.

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>Adaptation is not one process but at least two. A fast, explicit component (a deliberate re-aiming strategy) and a slow, implicit component (cerebellar recalibration driven by sensory prediction error) run in parallel and can even oppose each other; separating them has been a major theme of the last fifteen years (Taylor, Krakauer and Ivry, 2014). Layered on top is the two-timescale structure we met earlier in this series: fast and slow states that jointly explain savings, interference, and spontaneous recovery (Smith, Ghazizadeh and Shadmehr, 2006). How context decides which memory is expressed, and how these components are stored and retrieved, is exactly where my own research lives.</p>
</div>

## Why an invisible rewrite matters

That the brain relearns movement automatically, from its own failed predictions, is not just elegant. It is the foundation of rehabilitation: recovering movement after a stroke is in large part a matter of driving the right prediction errors so the nervous system rebuilds its models. It shapes how we design prosthetics and brain-machine interfaces, which the user must adapt to and which ideally adapt back. And it reframes practice itself. Getting better at a movement is less about willing yourself to do it right and more about exposing your brain to informative errors and letting the quiet machinery do what it does.

Take the glasses off. For a minute, the world tilts the other way, and your hand misses in a direction you never chose. That wrongness is the sound of a model being written back. You will not feel the writing. You never do.

<div class="series-note">
Next in <b>Mind in Motion</b>: if your brain predicts the consequences of its own movements, what happens to that prediction when you ask, who is moving my hand? The strange neuroscience of agency. Subscribe via <a href="/feed.xml">RSS</a>.
</div>

## References

<div class="refs" markdown="1">
1. Shadmehr, R., and Mussa-Ivaldi, F. A. (1994). Adaptive representation of dynamics during learning of a motor task. *Journal of Neuroscience*, 14(5), 3208-3224.
2. Tseng, Y.-W., Diedrichsen, J., Krakauer, J. W., Shadmehr, R., and Bastian, A. J. (2007). Sensory prediction errors drive cerebellum-dependent adaptation of reaching. *Journal of Neurophysiology*, 98(1), 54-62.
3. Martin, T. A., Keating, J. G., Goodkin, H. P., Bastian, A. J., and Thach, W. T. (1996). Throwing while looking through prisms: I. Focal olivocerebellar lesions impair adaptation. *Brain*, 119(4), 1183-1198.
4. Taylor, J. A., Krakauer, J. W., and Ivry, R. B. (2014). Explicit and implicit contributions to learning in a sensorimotor adaptation task. *Journal of Neuroscience*, 34(8), 3023-3032.
5. Smith, M. A., Ghazizadeh, A., and Shadmehr, R. (2006). Interacting adaptive processes with different timescales underlie short-term motor learning. *PLoS Biology*, 4(6), e179.
</div>
