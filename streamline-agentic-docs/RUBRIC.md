# Rubric

Judge each line: a bullet, sentence, or table row. Every line gets exactly one verdict, the first that applies, plus any rewrite tags that also apply. New lines are written to the same bar. Principles condensed from Matt Pocock's [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), plus repo checks.

## Verdicts

Only docs inside the repo count as the place that keeps a meaning. A contributor's global agent file never does, because teammates' agents lack it: a repo line that repeats it is judged on its own, as `cut: personal` for a preference or `move` to coding standards for a code rule.

| Verdict         | The line                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cut: stale      | is contradicted by the repo today, or describes finished scaffolding or a past state                                                                                                                               |
| cut: layout     | is excluded by [LAYOUT.md](LAYOUT.md): an `AGENTS.md` link to coding standards, a topic file's link back to coding standards, or a rule or topic file for a technology the repo does not use today                 |
| cut: derivable  | restates what the repo shows: config, manifest, task runner, `--help`, directory layout; a line carrying what no config confesses (the reason behind a choice, an unwritten convention, a gotcha) is not derivable |
| cut: duplicate  | repeats a meaning stated in another repo doc; name the one that keeps it                                                                                                                                           |
| cut: personal   | is one contributor's preference about how agents talk or work, not a rule of the repo                                                                                                                              |
| cut: no-op      | asks for what the agent already does by default                                                                                                                                                                    |
| cut: irrelevant | is exposition, history, inspiration, or credit that bears on no task                                                                                                                                               |
| move            | belongs in another tier by the placement test in [LAYOUT.md](LAYOUT.md)                                                                                                                                            |
| keep            | changes agent behavior, is true today, sits in the right tier, and is stated once                                                                                                                                  |

Rewrite tags attach to a `keep` or `move` line that also needs rewording:

| Tag          | The line                                                            |
| ------------ | ------------------------------------------------------------------- |
| pointer      | points at a doc without naming its trigger, or names one case twice |
| negation     | bans a behavior without stating the target behavior                 |
| leading word | spells out at several sites an idea one established term anchors    |
| scattered    | splits one concept's rules across headings                          |

## Principles

### Loads

Every always-loaded line spends tokens and attention on every turn, so `AGENTS.md` has the highest bar. A doc with no pointer spends human memory instead: someone must name it. Spend that only where human judgment should decide.

### Pointers

A pointer states what the target is and when to read it; its wording decides when the agent reaches the target.

- Front-load the trigger word.
- One trigger per distinct case; collapse synonyms of the same case.
- Skip identity the target already states.

Sharpen a weak pointer before inlining its target.

### Disclosure and co-location

Inline what every case needs; push behind a pointer what only some cases reach. Keep a concept's definition, rules, and caveats under one heading. A file still too long after cuts is sprawl: split it by topic.

### Leading words

An established term (_tautological_, _boundary_, _idempotent_, _deterministic_) anchors a region of behavior in one token. Repeat the term, never its explanation. Prefer an existing term to a coined one; a coined term needs a definition.

### Positive phrasing

Naming a banned behavior makes it more available. State the target behavior first; keep a prohibition only as a hard guardrail, paired with that target. "Names and types carry the meaning; no code comments."

### Single source of truth

Each meaning lives in one place. The repo is a source too: a doc restating config is a cache that goes stale. For lint-enforced rules, link the config and keep only the reasons for disabled or overridden rules.

### No-ops

Test each sentence: does it change behavior versus the agent's default? A sentence that fails is deleted whole, not trimmed. A term too weak to beat the default (_be thorough_) is a no-op; the fix is a stronger term.

### Completion criteria

A procedure in a doc ends on a checkable condition: "finish with `make check`", not "make sure it works".
