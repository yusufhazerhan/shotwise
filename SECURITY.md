# Security Policy

Thanks for helping keep Shotwise safe.

## Please report privately

Do not file public issues for vulnerabilities involving:

- authentication or session handling
- email verification bypass
- temp-mail abuse bypass
- export corruption or unsafe file generation
- data exposure
- secret leakage

Instead, contact the maintainers privately and include:

- a short summary
- affected area
- reproduction steps
- impact
- any suggested fix if you have one

If a dedicated security inbox is not yet listed in the repo settings, open a GitHub security advisory if available or contact the maintainer directly through a private channel already in use for the project.

## What to expect

We will try to:

- acknowledge the report quickly
- reproduce the issue
- determine severity and scope
- ship a fix or mitigation
- credit the reporter if they want that

## Supported areas

This repo is still evolving, so the highest-priority security surfaces today are:

- `packages/auth`
- local Studio storage and import/export flows
- scene JSON import/export
- template rendering
- environment docs

## Safe harbor

If you act in good faith, avoid data exfiltration, avoid service disruption, and give us a reasonable chance to fix the issue before public disclosure, we will treat your report as responsible disclosure.
