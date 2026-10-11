# Core rules

Default rules for `docs/coding-standards.md`. Propose each one the repo lacks, adapted to its stack and tools. Where a repo rule conflicts, the repo rule wins.

## Code

- Names, types, and structure carry the meaning; no code comments. Rationale and follow-up work go in Markdown docs. License notices and required tool directives are the exceptions.
- Small functions, explicit behavior. Abstract when callers share stable behavior; a little duplication beats an invented framework.
- A new dependency serves a real capability and comes with a recorded decision or the owner's approval.

## Boundaries and failures

- Parse external input at the boundary: requests, messages, configuration, third-party responses, model output. Inside, trust the types.
- Handle absence deliberately. A missing required value is an error; a default is part of the contract, never a mask for bad data.
- Surface failures. Expected ones are explicit outcomes or typed errors handled at the boundary. Success is reported only after every required write succeeds.
- Fix the demonstrated root cause. Retries, fallbacks, and feature flags as the fix need an explicit request.
- Secrets come from the environment or a secret store, and stay out of source, logs, and command lines.

## Tests

- Tautological tests considered harmful: a test must be able to fail when behavior breaks. Expected values come from the requirement, never from the code under test, a fixture literal, or a fake's own return value.
- Fakes only at system boundaries: network, datastore, model, clock. Internal modules run for real; no module mocking.
- A bug fix lands with a regression test that fails before the fix.
