# Topic template

```markdown
# <Topic> best practices

Source: [<Vendor> best practices](<official url>).

## <Concern>

- <rule>
```

Concerns are headings such as code, configuration, failures, observability, and tests; use only those the topic needs.

Each rule:

- Changes agent behavior for how this repo uses the technology. Skip what the SDK's types or the vendor's tooling already enforce.
- States the target behavior, with the vendor's concrete names, limits, and numbers.
- Co-locates the repo's own conventions for the technology, such as environment variable names, naming schemes, and per-environment values.
- Leaves repo-wide rules to coding standards.

A topic that outgrows one screen of rules splits into two topics.
