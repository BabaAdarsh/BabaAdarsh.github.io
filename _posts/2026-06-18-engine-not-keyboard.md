---
layout: post
title: "Why your motor cortex behaves more like an engine than a keyboard"
tags: [neural dynamics, motor cortex, mind in motion]
---

<div class="series-note">
<b>Mind in Motion</b> is a series about how the brain produces movement, written to be readable whether or not you do this for a living. The boxes marked <i>Going deeper</i> are optional extra depth for the specialists. This is post one.
</div>

Reach out and pick up your cup of coffee. Somewhere behind that ordinary motion, a sheet of cells in your motor cortex just did something. The question that has split movement neuroscience for forty years is deceptively simple: what, exactly, did those cells do?

The intuitive answer is that they spelled out the command. One population of neurons for "move right," another for "move up," each firing in proportion to how much of that direction you need, like keys pressed on a keyboard. Press the right combination and the arm follows. This picture is appealing, it is teachable, and for a long time it was close to the textbook view.

It is also, we now think, the wrong metaphor.

## The keyboard era

The keyboard idea has a respectable origin. In the early 1980s, Apostolos Georgopoulos and colleagues recorded from motor cortex while monkeys reached in different directions and found that many neurons had a preferred direction: a cell might fire hardest for reaches up and to the right, less for other directions, in a smooth cosine-shaped tuning curve (Georgopoulos et al., 1982). Add up the votes of the whole population, each cell pointing toward its preferred direction and shouting in proportion to its firing, and the sum, the "population vector," pointed almost exactly the way the arm was about to go (Georgopoulos, Schwartz and Kettner, 1986).

<figure>
<img src="/assets/img/blog/georgopoulos.png" alt="Cosine directional tuning and the population vector">
<figcaption>Left: each neuron fires according to a cosine tuning curve, peaking at its preferred direction. Right: for a movement at 50°, every neuron casts a vote toward its preferred direction scaled by its firing; the sum (the population vector, teal) lands almost exactly on the true movement direction (gold). Computed directly from the cosine tuning equations.</figcaption>
</figure>

That was a genuinely beautiful result. The population seemed to literally point where the hand would move. It made motor cortex look like a readout panel, a place where the intended direction of movement is written down in the language of firing rates.

But as people looked closer at what individual neurons do during a real reach, the readout panel started to look strange. A single cell's activity often rises, falls, and rises again within one short movement. It can flip its preferred direction partway through. Much of the activity does not line up neatly with the direction of the hand, or the force, or the speed, or any single thing you can measure about the movement. If each neuron is a key spelling out part of the command, why is so much of the typing apparently gibberish?

## A change of question

The breakthrough came from changing the question. Instead of asking what each neuron represents, a group around Krishna Shenoy and Mark Churchland at Stanford asked how the whole population moves as a unit over time. Not "what does this cell stand for," but "where is the population headed next, given where it is now."

When you ask it that way, the apparent gibberish snaps into order. Take the activity of hundreds of motor cortex neurons during reaching, summarize the dominant patterns, and the population state does not wander randomly. It rotates. Around the moment movement begins, the population traces smooth, lawful rotations, the same way the hands of a clock sweep, or a wheel turns (Churchland et al., 2012). Different reaches share the same rotational machinery; they mostly differ in where on the wheel they start.

That single observation reframes everything. A system whose state rotates in a regular way is not a lookup table. It is a dynamical system: something whose next state follows from its current state by a fixed rule, the way a swinging pendulum or a running engine evolves. Motor cortex, on this view, is less a panel where the command is written and more an engine that, once set spinning, generates the rich time-varying pattern of muscle activity a movement needs.

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>The rotations are usually revealed with jPCA, which fits the population's flow with a linear dynamical system constrained to be purely rotational (a skew-symmetric transition matrix, whose eigenvalues are imaginary). The fact that a low-dimensional, rotation-dominated linear model captures so much of the peri-movement variance is the actual claim. The interpretation, advanced most forcefully by Churchland, Shenoy and colleagues (2012), is that motor cortex acts as a pattern generator whose output drives muscles, and that the much-debated "preparatory" activity sets the initial condition from which those dynamics unfold (Churchland et al., 2010; Shenoy, Sahani and Churchland, 2013).</p>
</div>

## Setting versus running

The engine metaphor buys you something the keyboard never could: it explains what all that activity *before* movement is for.

Before you actually reach, motor cortex is already busy. On the keyboard view this is awkward, because nothing is moving yet, so what is being typed? On the dynamical view it is obvious. Preparation is winding the engine to the right starting point. The delay between deciding to move and moving is the time it takes to set the population's initial state. Release it, let the fixed dynamics run, and the rotation that follows produces the correct sequence of muscle commands. Aim the reach somewhere else and you simply start the same engine from a different point on the wheel.

This is a deep shift in what we think the cortex is doing. It is not narrating the movement as it happens. It is generating it, the way a wound music box generates a tune that was latent in how it was set, not in a running commentary.

## You can watch it appear from nothing

Here is the part I find genuinely striking, and it is where a small piece of code earns its place in the story rather than being the point of it.

Take an artificial network, a few dozen interconnected units with no built-in knowledge of brains, and train it to do one thing: produce the muscle-like outputs for reaching in different directions. Never tell it anything about rotations. Train it only to make good reaches. When you then look inside it and ask the Stanford question, where is the population headed next, you find the same rotations that motor cortex shows (an effect first demonstrated by Sussillo et al., 2015).

<figure>
<img src="/assets/img/projects/task-trained-rnn.png" alt="A trained network's reaches and its rotational population dynamics">
<figcaption>A recurrent network trained only to produce reaches (middle) develops low-dimensional rotational population dynamics (right), the same structure found in monkey motor cortex. Built with my <a href="https://github.com/BabaAdarsh/task-trained-rnn">task-trained-rnn</a> toolbox.</figcaption>
</figure>

That matters because it tells us the rotation is probably not a biological quirk or an accident of how cortex is wired. It looks like a natural solution to the problem of generating movement: if you need a machine that turns a held intention into a smooth, time-varying output, rotating dynamics are an efficient way to build one, and both evolution and gradient descent seem to find it. The brain and the artificial network arrive at the same trick from completely different directions.

<div class="deeper">
<span class="deeper-label">Going deeper</span>
<p>The convergence is suggestive but not proof that cortex implements the same computation; many dynamical systems can produce rotational projections, and the geometry depends on preprocessing (for example removing the condition-independent component before jPCA). The interesting research questions now are about what the dynamics are <i>for</i>: how feedback reshapes them within a movement, how the biomechanics of a real limb constrain them, and whether "rotation" is the right description or a shadow of something richer like input-driven or sequential dynamics. Those debates are very much alive.</p>
</div>

## Why it is more than elegant

This is not only a nicer story. It changes what you do.

Brain-machine interfaces that let paralyzed people control a cursor or a robotic arm work better when they read out the population's dynamics rather than trying to decode what each neuron "means." It reframes recovery after stroke as a question of whether the engine can still be set and run, not only whether individual cells respond. And it gives us a shared language, the language of dynamical systems, for comparing a biological brain and an artificial network on equal terms, which is a large part of why the field of NeuroAI exists at all.

The cup of coffee is in your hand now. Your motor cortex did not type out the command key by key. It set an engine spinning and let the lawful turning of a few hundred neurons carry your arm to the cup. Once you see movement that way, it is hard to go back to the keyboard.

<div class="series-note">
Next in <b>Mind in Motion</b>: if movement is a wound-up engine, what does it mean to <i>prepare</i> one, and why does getting ready take time? Subscribe via <a href="/feed.xml">RSS</a> to follow along.
</div>

## References

<div class="refs" markdown="1">
1. Georgopoulos, A. P., Kalaska, J. F., Caminiti, R., and Massey, J. T. (1982). On the relations between the direction of two-dimensional arm movements and cell discharge in primate motor cortex. *Journal of Neuroscience*, 2(11), 1527–1537.
2. Georgopoulos, A. P., Schwartz, A. B., and Kettner, R. E. (1986). Neuronal population coding of movement direction. *Science*, 233(4771), 1416–1419.
3. Churchland, M. M., Cunningham, J. P., Kaufman, M. T., Foster, J. D., Nuyujukian, P., Ryu, S. I., and Shenoy, K. V. (2012). Neural population dynamics during reaching. *Nature*, 487, 51–56.
4. Churchland, M. M., Cunningham, J. P., Kaufman, M. T., Ryu, S. I., and Shenoy, K. V. (2010). Cortical preparatory activity: representation of movement or first cog in a dynamical machine? *Neuron*, 68(3), 387–400.
5. Shenoy, K. V., Sahani, M., and Churchland, M. M. (2013). Cortical control of arm movements: a dynamical systems perspective. *Annual Review of Neuroscience*, 36, 337–359.
6. Sussillo, D., Churchland, M. M., Kaufman, M. T., and Shenoy, K. V. (2015). A neural network that finds a naturalistic solution for the production of muscle activity. *Nature Neuroscience*, 18, 1025–1033.
</div>
