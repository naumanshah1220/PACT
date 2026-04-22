# PACT — Subreddit Launch Posts

Each post is written to match the specific culture of that community. Do NOT post the same copy across multiple subreddits — redditors notice and it kills traction. Post these sequentially over 1–2 weeks, not all at once. Best days: Tuesday–Thursday, 9–11am ET.

Replace `[pact.game]` with the live URL before posting.

---

## r/gametheory

**Title:** Built a game that lets you actually *play* the Prisoner's Dilemma against strangers (and bots that tell you exactly what they'll do)

**Body:**
The Prisoner's Dilemma has always been a thought experiment. I built it as a game.

Two players, virtual gold on the line, open messaging channel, simultaneous reveal. The wrinkle: the practice AI opponents are explicit about their strategies. Lord Harkon says “Honour is the currency of fools. I prefer gold” — and always betrays. The Merciful Friar pledges without exception. The Oracle is genuinely random and says so.

What I’ve noticed watching test duels: players challenge the known-betrayer opponents *more* than any other. We think we can outsmart a system that has already stated it will defect. We never can.

Few questions I’m curious about from a game theory perspective:
- Against a known pledger, betrayal is dominant. How many players actually exploit this vs. mirror-pledging out of some sense of fairness?
- Against a known betrayer, Nash equilibrium says betray back. But most players pledge anyway on first encounter.
- The iterated version: players build public reputation over many duels. Does reputation shift the equilibrium in the direction Axelrod’s work predicts?

Free to play at [pact.game], no signup needed for practice mode. Curious what strategies you’d use.

---

## r/InternetIsBeautiful

**Title:** A medieval-themed Prisoner's Dilemma where strangers negotiate before deciding. The AI opponents have distinct personalities and tell you (almost) exactly what they'll do.

**Body:**
Two players wager gold. You can talk to each other first. Then you simultaneously choose: **Pledge** or **Betray**.

The practice opponents are medieval characters — Lord Harkon tells you outright he’ll betray you. The Merciful Friar swears he’ll pledge. The Oracle says the fates alone decide (he means it — he’s actually random). None of them lie about who they are. You still want to trust them.

The design is dark parchment, medieval typography, wax seals. It captures the specific anxious feeling of not knowing what a stranger will do — but in a way that feels more like a fairy tale than a form.

Free, no signup required to play against the bots: [pact.game]

---

## r/WebGames

**Title:** PACT – Real-time Prisoner's Dilemma. Talk to your opponent, then simultaneously choose: Pledge or Betray.

**Body:**
Two players, gold on the line, open chat, simultaneous reveal. You’ve got a time limit. You can say anything before you decide.

Practice mode has 30 named bot opponents with distinct medieval personalities and different strategies — some always cooperate, some always betray, some are genuinely random. Their opening messages are written to make you *feel* the decision even when you know the answer logically.

No download, no signup required for practice mode.

[pact.game]

*Let me know in the comments what you chose against Lord Harkon. (He told you. You did it anyway, didn’t you.)*

---

## r/SideProject

**Title:** I built a multiplayer Prisoner's Dilemma game over 3 months. Here's what surprised me.

**Body:**
PACT is a web game where two players wager virtual gold and simultaneously choose to cooperate or defect — but first, they can message each other freely.

**Three things that surprised me during development:**

1. **The "cheap talk" effect is real and strong.** Letting players communicate before deciding roughly doubles cooperation rates even though nothing said can be enforced. I expected it to make no difference — why would an unverifiable promise change anything? It does.

2. **Players flock to the obviously-cheating bot.** Lord Harkon tells you directly that he always betrays. He gets more challenges than almost any other opponent. We are all convinced we’re the exception.

3. **The hardest UX problem was the simultaneous reveal.** Both players need to see results at exactly the same moment after both have committed. If either player sees the result before the other commits, the game breaks. Took two different architectures before I got this right.

Built with Next.js, Supabase, Tailwind. Free, deployed on Vercel. No signup required for practice mode.

[pact.game]

Happy to talk through any of the technical or design decisions.

---

## r/BehavioralEconomics

**Title:** Built a game to study cheap-talk cooperation in the Prisoner's Dilemma. Some early patterns are interesting.

**Body:**
PACT is a multiplayer Prisoner's Dilemma where players can message each other before making their simultaneous choice. I built it partly as a game and partly as an observation tool for exactly the phenomena this community studies.

A few patterns I’ve noticed watching test duels:

- Players who make *explicit* verbal commitments to cooperate (“I’ll definitely pledge”, “we both win if we trust each other”) betray at higher rates than players who say nothing or speak ambiguously. Verbal pre-commitment may function as psychological pre-absolution.

- Players who *name the game* directly (“I know the dominant strategy is to betray — I’m pledging anyway”) have the highest actual cooperation rates. Naming the trap disarms it.

- The most-challenged opponent is Lord Harkon, who opens with a direct statement that he will betray. Players pledge to him at rates that should not be possible given explicit forewarning. Optimism bias operating on named, characterised agents appears stronger than on abstract opponents.

I’m genuinely interested in running controlled experiments on the platform (framing effects, time pressure, reputation). If you work in this space and want to use it for research, happy to talk.

Free to play at [pact.game].

---

## r/philosophy

**Title:** The Prisoner's Dilemma as a live, playable game — and what it feels like when a real stranger is on the other end

**Body:**
You’ve thought about the Prisoner's Dilemma as an abstraction. PACT is what happens when it’s real.

Two players, gold at stake, open message channel, simultaneous reveal. Before the choice, you can say anything. None of it is enforceable. The only question is what kind of person you are right now, in this specific moment, with this specific stranger watching.

A philosophical question that came up repeatedly while building this: is a promise made in a game a real promise?

I don’t mean legally. I mean psychologically, morally, in the sense that matters for how you feel about yourself afterward. When you tell a stranger you’ll cooperate and then betray them, something happens. The betrayers feel it. The betrayed feel something different but equally real.

Most players — even in a game with virtual currency and no binding commitments — treat the promises they make as genuine. That finding is maybe more interesting than any specific result about cooperation rates.

Free to play at [pact.game]. I’d be interested in what this community thinks about the ethics of game deception.

---

## r/SquidGame

**Title:** Built a game with the same moral architecture as the marble episode — but you can actually talk to your opponent before you decide

**Body:**
You know the marble episode. The one where they pair people up and make them play a game for the other person’s marbles — but nobody explains the rules until you’re already emotionally invested in your partner.

The horror of that episode isn’t the stakes. It’s the structure: you built trust, and now the game asks you to use it against someone. You cooperate or you don’t, and someone gets hurt either way.

PACT is that as a repeatable, low-stakes game. Two players wager virtual gold. You can talk to each other first. You both choose: **Pledge** (cooperate) or **Betray** (defect). The reveal is simultaneous — you find out at the exact same moment they do.

What makes it hit: the practice opponents have personalities. Lord Harkon tells you he’ll betray you and means it. The Merciful Friar swears he won’t, and he won’t. You still feel the pull of doubt.

No signup needed for practice mode: [pact.game]

---

## POSTING NOTES

- Space posts at least 3–4 days apart
- Reply to every comment in the first 2 hours — this is what drives visibility on Reddit
- On r/gametheory and r/BehavioralEconomics: lead with genuine intellectual engagement, not promotion. If commenters are curious, the link does the work.
- On r/InternetIsBeautiful: add a screenshot of the duel room (dark parchment aesthetic is the hook there)
- On r/WebGames: mention specific bots by name in comments to invite discussion of strategies
- Cross-posting between communities is fine but use different titles and different bodies — the culture varies significantly
