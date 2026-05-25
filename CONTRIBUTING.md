# Contributing to Shotwise

Thanks for showing up. We want Shotwise to feel approachable to contributors, not like a repo that only works for the original authors.

## Ground rules

- Be kind in reviews and issues.
- Prefer small, focused pull requests.
- If a product decision conflicts with `README.md` or `SKILL.md`, update the relevant file or raise the mismatch before shipping code.
- Manual editor quality, export reliability, and self-host usefulness matter more than flashy demos.

## Before you start

Read these files first:

1. `README.md`
2. `SKILL.md`
3. `SECURITY.md`

They define the local-first Studio workflow, agent-assisted screenshot workflow, and safety expectations.

## Local setup

```bash
pnpm install
pnpm --filter @shotwise/web dev
```

Useful URLs:

- `http://localhost:3000` local Next app
- `http://localhost:3000/studio` no-login local Studio

## Development workflow

We use a strict `red -> green -> refactor -> smoke` loop.

For user-facing features:

1. add or update the smallest failing test
2. implement the minimum passing change
3. refactor with tests still green
4. run app tests
5. run smoke

Required checks for most changes:

```bash
pnpm typecheck
pnpm test
pnpm --filter @shotwise/web test
pnpm --filter @shotwise/web smoke
```

If you touch shared rendering, local storage, templates, or export logic, also run the relevant package tests directly.

## Scope rules

These are core OSS priorities:

- manual editor
- preview/export parity
- templates and color themes
- locale/device/theme export matrix
- visual device previews
- SKILL.md assisted local production

These are not core prerequisites:

- cloud sync
- premium templates
- direct store uploads

If you are unsure whether something belongs, use this question:

> Does this make the open-source manual editor or export pipeline more useful on its own?

If yes, it is probably core.

## Pull requests

Please include:

- what changed
- why it changed
- how you tested it
- screenshots or short recordings for UI changes

If your PR changes product behavior, update `README.md` or `SKILL.md`.

## Design changes

Do not freestyle new UI patterns when the current design language does not already support them.

For larger Studio, editor, export, or marketing surface changes, include screenshots or a short recording in the PR and implement against the current design language.

## Security

Please do not open public issues for credential leaks, export corruption, browser storage issues, or anything that could expose user data. Use `SECURITY.md` instead.
