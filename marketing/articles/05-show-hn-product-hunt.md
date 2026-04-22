# Show HN: PACT – A multiplayer Prisoner's Dilemma where you negotiate before you decide

*Target: Hacker News (Show HN), Product Hunt, r/SideProject, dev.to. Voice: humble builder, technically specific, honest about failures.*

---

PACT is a two-player web game based on the Prisoner's Dilemma. Players wager virtual gold, communicate freely in real time, then simultaneously choose to PLEDGE (cooperate) or BETRAY (defect). Results are revealed at the same moment to both players. No turns, no rounds — just one decision, made with complete information about everything except what your opponent chose.

Demo: [pact.game] — anonymous play, no signup required for practice mode against the named bots.

---

## Why I Built It

I'd been obsessed with the Prisoner's Dilemma for years — not the abstract game theory, but the *experience* of it. The specific texture of trusting a stranger and being wrong. Most existing implementations are either mechanical (click a button, see a payoff matrix) or philosophical (discuss it as a thought experiment). I wanted something that felt like a real social encounter with real stakes.

The key design decision: **players talk before they decide.** This is genuinely unusual. Most Prisoner's Dilemma implementations forbid pre-game communication. But "cheap talk" — non-binding communication before a strategic decision — is one of the most interesting areas of behavioural economics. Allowing players to communicate roughly doubles cooperation rates even when neither party can be held to anything they say. The words matter even though they don't have to.

I wanted to build a game where the negotiation *was* the experience, not a feature bolted onto a mechanical core.

---

## The Bots

There are 30 practice bot opponents, each with a medieval fantasy personality, a distinct strategy, and a characteristic opening message.

Some always pledge. Some always betray. Some are genuinely random. Each tells you something about what they'll do — but you have to read between the lines.

Lord Harkon opens with: *"You are deciding whether to trust me. Let me help: you shouldn't. But I find that people trust me anyway. It's why I do this."* He always betrays. Players challenge him more than almost any other opponent. Knowing the answer and trying anyway is apparently irresistible.

Building the bot personalities was unexpectedly the most interesting design work in the project. Each one needed to be:
- Immediately characterful (readable in one sentence)
- Psychologically consistent (their strategy should feel right for their character)
- Resistant to being gamed (players should feel the *temptation* to trust even when they know they shouldn't)

---

## Technical Decisions

**Stack:** Next.js 14 (app router), Supabase (auth, realtime, database), Tailwind CSS, deployed on Vercel.

**The hardest problem:** Simultaneous reveal across variable network conditions.

Both players need to see results at exactly the same moment, after both have committed. If player A commits and player B is on a slow connection, player A can't see the result early — that would let them observe the outcome before B does, which breaks the game entirely.

The solution: a two-phase commit pattern. When a player commits their choice, we store it server-side but don't return their opponent's choice. Only when *both* players have committed does the server release both choices simultaneously. Combined with Supabase realtime subscriptions and a deliberately short server-side delay to smooth over network jitter, the reveal feels genuinely simultaneous even at 200ms+ round trips.

**What I got wrong:**

First version had no time limit on decisions. Duels would persist indefinitely, with players checking back occasionally. The tension evaporated completely. The timer (variable by challenge, defaulting to 60 minutes) was the single change that made the game feel real. Without a deadline, the decision carries no weight. With one, every minute of the clock is part of the psychology.

Also: I built the social/messaging features before the currency/stakes features. Playtesters didn't care about the conversations until they understood what was on the line. Always explain the stakes before you explain the interaction.

**What's next:**
- Public reputation leaderboard
- Spectator mode for live duels
- Weekly tournament with prize pools
- Researcher API for running controlled trust experiments

---

## Numbers

- Time to build: ~3 months (evenings/weekends)
- Bots: 30 personalities, 3 strategies (pledge/betray/random)
- Decision timer: 60–480 minutes depending on challenge
- Gold mechanic: virtual currency, earnable through wagers and daily login

---

Happy to answer questions about the design decisions, the game theory implementation, or the realtime sync architecture. The repo isn't public yet but I can share specifics.

Try it: [pact.game]
