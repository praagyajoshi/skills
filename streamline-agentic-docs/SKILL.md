---
name: streamline-agentic-docs
description: Audit a repo's agent docs (AGENTS.md, coding standards, best practices) and bring them onto the three-tier layout, on approval.
disable-model-invocation: true
---

# Streamline agentic docs

Bring a repository's agent-facing docs onto the three-tier layout in [LAYOUT.md](LAYOUT.md), judging every line with [RUBRIC.md](RUBRIC.md). One flow: audit, propose, wait for approval, write, verify.

The scope is the docs. The skill reads code and config only to judge what a doc says, and changes docs only. Whether the code follows a rule is out of scope: a code problem noticed along the way gets one line under "Out of scope" in the report, with no investigation or fix.

## 1. Inventory

Collect every agent-facing doc at every level: `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, coding-standards files under any name or folder (`coding_standards.md`, `CONTRIBUTING.md`, `docs/standards/`), best-practices files, app-level agent files, and skills the repo authored (each `SKILL.md` with its reference files). Vendored skills, marked by a lockfile, an upstream note, or a pinned source, follow their upstream: audit only the pointers to them. Read the manifests and configs that reveal the stack and its tooling: package manifests, infrastructure templates, lint/format/compiler configs, Makefile or task runner, CI workflows.

Done: a list of every doc with path and line count, plus the configs read.

## 2. Detect topics

From the manifests and configs, list each platform or service the repo uses today for which the vendor publishes best practices: runtimes, orchestrators, datastores, queues, schedulers. Each is a candidate topic file. Language rules belong in coding standards, not a topic file.

Done: every candidate cites the file that proves current use. A technology mentioned only in docs or plans is not a candidate.

## 3. Audit every line

Audit every line of every doc against [RUBRIC.md](RUBRIC.md) using the brief in [AUDITOR.md](AUDITOR.md). The result is working notes: one row per line, kept in a scratch file outside the repo. They drive the proposal and answer requests for details; the proposal does not print them.

When subagents are available and the inventory holds more than five docs, fan the audit out: dispatch one auditor per doc group, all at once (each `AGENTS.md` level, the coding standards, topic files in batches of about five, the authored skills). Give each auditor the brief, its files, the full inventory, and the topic candidates. Otherwise audit inline with the same brief.

Then merge the rows. Where two rows each name the other as the copy that stays, keep the copy in the tier [LAYOUT.md](LAYOUT.md) assigns. Compare the coding standards against [CORE-RULES.md](CORE-RULES.md): each core rule the repo lacks is a proposed addition; where a repo rule conflicts, the repo rule wins and the conflict is noted.

Done: every line of every doc is covered by a row with evidence, and none is unsure. When a no-op verdict is genuinely uncertain, the verdict is keep and the line becomes a question.

## 4. Propose and stop

Present a summary the user can take in at a glance, in this order and nothing more:

1. Headline: `**<repo>: <N> docs → <M>. <K> decisions needed.**`
2. Change table, one row per file: `File | Change | Why`. Change is rewrite (with line counts), move, rename, restructure, delete, or add. Why is one clause naming the main reason. Files sharing a change and a reason share a row.
3. `**Fixes:**` stale facts, one clause each.
4. `**Adds:**` core rules and new topic files, on one line.
5. `**Decide:**` numbered questions, each with its options and a recommendation.
6. `Out of scope:` one line.
7. "Approve all, name what to change, or say _details for <file>_ for its per-line verdicts."

Omit a section that is empty. When the user asks for details, print that file's rows from the notes.

Example:

> **claro: 14 docs → 9. 3 decisions needed.**
>
> | File                                                 | Change                                          | Why                                                                   |
> | ---------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
> | `AGENTS.md`                                          | rewrite, 54 → ~12 lines                         | stack, commands, layout derivable; code rules move to standards       |
> | `coding_standards.md`                                | move to `docs/coding-standards.md`, restructure | topic router replaces the area table; adds Tests, Checks, Lint policy |
> | `docs/standards/` (6 files)                          | move to `docs/best-practices/`                  | `runner` → `github-actions`, `core` → `anthropic`                     |
> | `queues`, `workflows`, `durable-objects`, `kv`, `r2` | delete (147 lines)                              | not used in any config                                                |
> | `tooling.md`                                         | fold into standards, delete                     | lint and check rules belong in standards                              |
>
> **Fixes:** `workers.md` `compatibility_date` → `compatibilityDate`; `Deps` list missing `cfg`.
> **Adds:** 5 core rules: absence, failures, secrets, root cause, small functions.
>
> **Decide:**
>
> 1. `core.md`: topic file `anthropic.md` (recommended), or fold into standards?
> 2. Add a guardrail: deploy, remote migrations, and secrets only when asked?
> 3. `bunx lefthook install`: move to `docs/setup.md`, or drop?
>
> Approve all, name what to change, or say _details for <file>_ for its per-line verdicts.

Done: the user has explicitly approved a set of changes. Apply only those.

## 5. Write

Apply the approved changes. Move tracked files with `git mv`. Update every inbound link to a moved or deleted file, including READMEs, app docs, and tool docs. Research each new topic file from the vendor's current official best-practices docs, one subagent per topic in parallel when available, and follow [TOPIC-TEMPLATE.md](TOPIC-TEMPLATE.md); when those docs cannot be fetched, skip the topic file and report it rather than writing from memory. Every new line must earn `keep` under the rubric.

## 6. Verify

Run `node <this skill's directory>/scripts/check.ts <repo root> [other touched .md files]`. It checks:

- Every relative link and anchor in the tier files and the extra files resolves.
- Every topic file is linked from the `## Topic best practices` section of `docs/coding-standards.md`.
- No `AGENTS.md` or topic file links to coding standards.
- No `CLAUDE.md` or `.claude/CLAUDE.md` remains at any level; a `CLAUDE.local.md` is reported as a warning.

Then check by reading: no meaning is stated in two tiers, and no `AGENTS.md` line is derivable. Run the repo's formatter on touched files.

Done: the script exits 0, the reading checks hold, and the formatter passes; or the report names the check that could not run and why.

Report in the shape of step 4: the change table as applied, the check results, and anything skipped.
