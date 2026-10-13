---
name: create-verification-skill
description: Generate a project-local verify-APP skill that launches the repo's real app, drives a feature the way a user would, captures evidence, and cleans up, plus a seeded feature map. Works under any agent harness (Claude Code, Cursor, Codex, Amp, others). Use when a repo has no scripted way to prove behavior end to end, when asked to "set up verification", "make a verify skill", "teach agents to run/drive this app", or before work that needs proof in the real app rather than unit tests.
---

# Create a verification skill

Every serious project needs a scripted way to drive the real app and prove behavior: launch it, exercise a feature the way a user would, and capture evidence. This skill generates that as a project-local skill, `verify-<app>/`, tailored to the repo.

You write for the next agent, not for a human. It reads the output cold, mid-task, having never seen the app, and it may run under a different harness than yours. So the generated skill uses only what every harness has: a shell, files, and tools the repo or a package manager provides. Harness-native tools (a built-in browser, an MCP server, subagents) can appear as optional shortcuts, never as the only path.

## 0. Pick the output location

Write the skill where the harness that will run it loads project skills:

1. If the repo already has project skills (`.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, `.gemini/skills/`, …), put `verify-<app>/` next to them. If several dirs exist, use the one with the most skills, and report the others.
2. Otherwise use your own harness's project skill dir. Common ones: Claude Code `.claude/skills/`, Cursor `.cursor/skills/`, Codex and Amp `.agents/skills/`. Check your harness's docs if unsure; these paths change.
3. If the user names harnesses the team uses, write once into one of them and mention that the other harnesses can be given a symlink to it. Don't create the symlinks unless asked.

`<skill-dir>` below means the chosen `…/skills/verify-<app>/`.

## 1. Interview the repo, not the user

Answer these from the codebase. Ask the user only what you cannot observe:

- **Surface**: what does a user actually touch? A web UI, a CLI/TUI, a desktop app, an API, a mobile app, a library? A repo can have several. Pick the primary one and note the rest.
- **Run**: how does the app start locally? Prefer the repo's own documented dev command (package scripts, Makefile, README quickstart). Note ports, env vars, seed data, auth.
- **Drive**: how can an agent interact with it from a shell? Existing harnesses first: Playwright/Cypress specs, expect scripts, PTY helpers, curl-able endpoints, a debug port. Only then pick a generic recipe: a scriptable browser (Playwright, `agent-browser`, CDP) for web and Electron, tmux or a PTY wrapper for CLI/TUI, plain HTTP for services. Pick a driver the next agent can install and run from a shell. A browser tool that only exists inside your harness doesn't count.
- **Observe**: what evidence can be captured? Screenshots, terminal transcripts, response bodies, logs, exit codes, DB state.
- **Isolate**: can two instances run side by side (ports, data dirs, profiles)? If not, say so in the generated skill. Refusing to double-drive a shared instance beats corrupting the user's session.

If the checkout doesn't build or start as-is, fix that first, or report exactly what is broken, before generating. A skill written against a broken base teaches wrong steps. When an irrelevant missing asset blocks startup (a static dir the API never serves, a sample config), the generated skill may create it, clearly marked as verification scaffolding, and remove it in cleanup.

## 2. Generate the skill

Write `<skill-dir>/SKILL.md`. Frontmatter holds only `name: verify-<app>` and a `description` that names the app, the surface, and when to use it. Those two fields are what every harness reads, and without them the skill never registers. Leave out harness-specific keys. Below the frontmatter come these sections, each grounded in what the interview actually found. Leave no placeholders.

- **Launch**: the exact command that starts the app for verification, and how to tell it's ready (a log line, a prompt). Launch must reach a usable state from an empty data dir, including migrations and seed data. Ready means usable, not just that a process answers: a database health check can pass while its init scripts are still running. Include teardown. A short-lived CLI or TUI has no server to keep alive. There, launch means build the binary (or install deps) once, then start each drive in its own isolated PTY or tmux session.
- **Doctor**: one read-only check that answers "is this instance worth driving?": process up, right version/build, port owned by us, auth valid. Tell the agent to run it first whenever anything looks off.
- **Drive**: the harness recipe with real selectors and commands from this repo, not examples. Prefer stable handles (ARIA labels, data attributes, prompt strings, route paths) over coordinates and tab order. Write every step as a shell command or a script invocation. If a harness-native tool is faster, add it after the shell path as an optional shortcut.
- **Evidence**: what to capture for a proof, and where. Name one evidence root, for example `<repo>/.verify-runs/<app>/<UTC timestamp>/`, kept out of git (`.git/info/exclude` avoids editing the repo's `.gitignore`). State the proof standards:
  - Exercise the real user path, not internal setters or test-only endpoints.
  - Capture the action and the resulting state, not just the final screen.
  - Verify side effects (files written, rows inserted, messages sent) alongside what's visible.
  - Use mocks only where a production boundary already isolates the external system.
  - When the safe path is a dry-run or test mode, observe what it actually skips (files, network, git refs) instead of trusting its name. Some dry-runs still touch the network or open a browser.
- **Cleanup**: how to tear down instances the run created. Kill what you started (record PIDs, container IDs, tmux session names at launch), never by process name. Cleanup removes instances and scratch state, never the evidence. Proof artifacts survive teardown under the evidence root.
- **Helpers**: any script the skill ships lives in `<skill-dir>/scripts/`, is executable (`chmod +x`), has a shebang, uses paths relative to its own location, and is shown with its exact invocation in the skill body. A helper the reader has to reverse-engineer is not a helper.

## 3. Seed the feature map

Create `<skill-dir>/features/README.md` plus one file per user-facing feature you can find. Start with the top 3–5, taken from routes, commands, menus, or docs. Follow the shape in [references/feature-map-example/](references/feature-map-example/README.md): a README index and one file per feature. Each file answers, from the user's point of view, what the feature is, how to reach it, how to drive it with the harness, and what observable end state proves it works. Use these four H2s:

- `Sub-features`
- `How to get to it (user POV)`
- `Driving it with <driver>`
- `Gotchas`

If the seed data lacks a precondition a journey needs, the journey reports a failure and the reason goes in that feature's Gotchas. Never weaken a journey to make it pass. The map is the repo's maintained verification source. A proof that drives one convenient entry point is incomplete when the map lists others.

End the README with a short **Keeping this map honest** section: when a change adds, renames, or removes a route/command/menu, update the matching feature file in the same change. When a journey fails because the app changed rather than broke, fix the journey and note why in Gotchas.

## 4. Prove the generated skill before handing it over

Follow the generated skill's own instructions end to end once, using only what it says (shell commands and its helpers, not your harness's extras): launch, doctor, drive ONE mapped feature, capture evidence, clean up. One feature is enough. The map exists so later runs can cover the rest. After cleanup, confirm the evidence still exists at the evidence root. A cleanup that deletes the proof fails this step.

Fix whatever fails. Run the generated cleanup after every failed attempt too, so broken attempts don't leave processes running or ports held. A generated skill that was never executed is a draft, not a deliverable.

If you proved it in a stand-in for the real target (a container instead of a fresh VM, a local stack instead of a remote one), list every setup step the stand-in did that the target will not. Those steps stay unverified until a run on the real target covers them.

## 5. Report

Tell the user:

- where the skill was written, and which harnesses load that path
- the proof run: feature driven, evidence path, cleanup result
- unverified stand-in steps, if any
- that the feature map's **Keeping this map honest** section is the maintenance loop. If a dedicated maintenance skill (e.g. `maintain-verification-skill`) is installed, point at it.

Suggest a re-verification cadence only if asked.
