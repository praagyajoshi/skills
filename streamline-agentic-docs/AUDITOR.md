# Auditor brief

Audit the assigned agent docs of one repository, line by line. Read [RUBRIC.md](RUBRIC.md) and [LAYOUT.md](LAYOUT.md) first. Read the repo; change nothing.

Inputs: the repo root, the files assigned to you, the full doc inventory, and the topic candidates.

For each line of the assigned files, a bullet, sentence, or table row:

- Give one verdict and any rewrite tags from the rubric.
- Check each factual claim about the repo (paths, tools, commands, technologies in use) against the repo; a claim the repo contradicts is stale. Whether the code follows a rule is out of scope.
- For `cut: duplicate`, search the other docs in the inventory and name the copy that stays as `file:line`.
- Cite evidence: the file, config, command output, or doc that justifies the verdict.

Return rows only, in this shape:

```text
file:line | short quote | verdict | tags | evidence
```

Consecutive untagged `keep` lines share one row (`file:7-15 | … | keep | | …`). After the rows, add `Questions:` for uncertain no-ops and claims you could not check, and `Out of scope:` for code problems noticed in passing; one line each.

Done: every line of every assigned file is covered by a row.
