# Layout

Three tiers, ranked by how often an agent loads them. The more often a tier loads, the higher the bar for each line in it.

| Tier                 | Path                             | Loaded                                             | Holds                                                           |
| -------------------- | -------------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| Agent instructions   | `AGENTS.md`                      | every turn                                         | repo facts and limits an agent cannot learn by reading the repo |
| Coding standards     | `docs/coding-standards.md`       | by review and implementation skills, which name it | rules that bind every change                                    |
| Topic best practices | `docs/best-practices/<topic>.md` | when a change touches that topic                   | rules for one technology                                        |

Placement test:

- Every change needs it: coding standards.
- Only changes touching one technology need it: that topic file.
- Every task needs it, the repo cannot reveal it, and it is not a code rule: `AGENTS.md`.
- The repo already shows it: nowhere.

## AGENTS.md

One file per level: the root, plus an app folder when the app needs one. Codex and other agents read `AGENTS.md`, and so does Claude Code from v2.1.277, but Claude Code reads it only when no `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` sits in the working directory or above it; any of those makes it read the `CLAUDE.md` files instead ([Claude Code docs](https://code.claude.com/docs/en/memory.md#agents-md)). So wherever a `CLAUDE.md` or `.claude/CLAUDE.md` exists, at any level, merge any line that earns `keep` into the `AGENTS.md` at that level and delete it, including one that is only a symlink or an import of `AGENTS.md`. A `CLAUDE.local.md` is a contributor's own uncommitted file: report that it hides `AGENTS.md` from them, and leave it to its owner.

Holds:

- One line of purpose and scope.
- How to decide versus ask.
- Repo-specific guardrails: deploy, provision, or publish only on request; dormant surfaces; the release path.
- Pointers to repo-local skills, as `<case>: use <path>`.
- The issue tracker, triage labels, and domain docs block that agent skills read, when present.

Everything else lives elsewhere: stack, command catalog, and directory layout in the repo itself; coding rules in coding standards; one contributor's personal preferences in their own global file; generic agent defaults nowhere.

`AGENTS.md` carries no link to coding standards. Review and implementation skills read `docs/coding-standards.md` directly.

Rules from a contributor's global agent file that bind code quality, such as root-cause fixes, belong in coding standards so every contributor's agent follows them.

### Monorepos

`apps/<name>/AGENTS.md` holds only facts specific to that app. All standards and topic files live in the root `docs/`.

## docs/coding-standards.md

In this order:

1. One line of scope: which code it binds. Generated and vendored files follow their generator or upstream.
2. `## Topic best practices`: one line per topic, `<what the change touches>: read [<Topic> best practices](best-practices/<topic>.md).`
3. Rule sections by concern, such as code, language, boundaries and failures, infrastructure, tests, checks.
4. Lint policy: a link to the lint config plus a table of disabled or overridden rules with their reasons.

## docs/best-practices/\<topic\>.md

One file per technology in use today; adopting a technology adds its file and its router line together. Each file follows [TOPIC-TEMPLATE.md](TOPIC-TEMPLATE.md). Topic files are leaves: they may link a sibling topic they build on, and carry no link back to coding standards.
