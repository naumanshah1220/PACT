# Can You Lie Your Way to Cooperation? What Happens When Humans Negotiate Before They Betray

*Target: r/BehavioralEconomics, r/psychology, Substack economists, academic-adjacent Twitter. Voice: data journalist, slightly academic, findings-first.*

---

There's a 1993 experiment that should be more famous than it is.

Researchers had participants play the Prisoner's Dilemma — the classic two-player trust game where each person must independently choose to cooperate or defect. Before the choice, some pairs were allowed to communicate freely. The result: pre-play communication roughly doubled cooperation rates.

The striking part isn't that communication helped. It's *why* it helped. The promises made weren't enforceable. Players knew this. And yet saying "I'll cooperate" to a real person — even a stranger, even in a game — created a genuine psychological commitment. It cost nothing to promise and nothing to break. People kept their word anyway.

This is what game theorists call "cheap talk." It's cheap because it's costless and unverifiable. It works because we are, at bottom, creatures who take our own words seriously.

PACT is built around this finding. Every duel opens with an unstructured message channel. Players can say anything: reason, plead, philosophise, threaten, or say nothing at all. Only they know whether their words match their intentions. The game is an extended observation of what people do in exactly this situation.

---

## What People Actually Say Before They Betray Someone

Across our testing and the broader literature on negotiated Prisoner's Dilemma games, several patterns emerge with uncomfortable consistency.

**The over-assurer.** They commit to cooperation explicitly, often multiple times. They invoke fairness. They use phrases like "we both win if we trust each other" and "there's no reason to betray here." In testing, this rhetorical pattern correlates *positively* with eventual defection. Players who talk most about cooperating tend to cooperate least. The hypothesis: verbal commitment functions as pre-emptive absolution. Saying it out loud relieves the internal pressure of not meaning it.

**The silent one.** They respond briefly, or not at all. They don't commit in either direction. They acknowledge the duel without editorialising. This pattern, counterintuitively, predicts cooperation at above-average rates. The inference: there's no case to build when the decision is already honestly made.

**The philosopher.** They name the game directly. "We both know what the dominant strategy is. I'm cooperating anyway." This is the most reliable predictor of actual cooperation in our data. The act of naming the trap seems to neutralise it. Acknowledging that you *could* betray, and choosing not to, produces a kind of integrity effect.

**The honest villain.** Like Lord Harkon in PACT, who opens every duel with a direct statement that he will betray you. Remarkably, this generates *more* challenges, not fewer. Players who've read his disclaimer still pledge to him at startling rates. The combination of being forewarned and still hoping you're the exception is one of the most persistent failure modes in human cognition.

---

## What We Expect to Learn as PACT Scales

**Does aesthetic framing affect cooperation rates?** There's strong evidence that labelling changes decisions. An identical game called "Community Game" produces measurably more cooperation than the same game called "Wall Street Game." Framing PACT in a medieval tavern — with cloaked figures, wax seals, and parchment textures — creates psychological distance from modern transactional life. Our hypothesis: this increases cooperation by 10–15% compared to an equivalent game with neutral UI.

**Does reputation become self-fulfilling?** Players with high pledge rates should attract opponents who also cooperate, because the asymmetric betrayal payoff is less attractive against someone you believe won't cooperate back. We expect to see cooperation rates polarise over time: consistent betrayers find themselves duelling other betrayers (mutually destructive), while consistent pledgers attract pledgers (mutually beneficial).

**Does playing known-strategy bots calibrate behaviour against humans?** PACT's practice bots are explicit about their strategies. The Merciful Friar always pledges; Lord Harkon always betrays; the Oracle is genuinely random. Does experience with predictable agents improve a player's ability to read unpredictable humans? Early observation: yes, measurably. Players who start with bot practice show higher discrimination between trustworthy and untrustworthy human opponents in their first live duels.

**Does the time limit matter?** All PACT duels have a clock — typically 60 minutes. We hypothesise that approaching deadlines increase betrayal rates, even among players who intended to cooperate. Urgency disrupts deliberative decision-making and activates instinctive self-interest. The last ten minutes of a duel may tell you more about a player than the first fifty.

---

## A Note on Research Collaboration

The PACT dataset — real-time messages, decision timing, outcomes, and player reputation history — is unusually clean for studying trust and cooperation under naturalistic conditions. If you're a researcher interested in running studies using the platform (A/B framing experiments, time-pressure manipulations, reputation effects), reach out. The architecture was designed with this in mind.

The game is free to play at [pact.game]. No signup required for practice mode against the named bots.

The question — the one the literature has been circling since 1950 — is still open: under what conditions do people choose to cooperate when they don't have to?

Come add a data point.
