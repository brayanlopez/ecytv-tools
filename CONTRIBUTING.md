# Contributing

## Getting Started

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Run `pnpm install`

## Before PR

- Run `pnpm lint`
- Run `pnpm test`
- Run `pnpm format`
- Verify coverage: `pnpm test:coverage`

## Commit Conventions

Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `style:`.

## Branch Naming

- `feat/short-description`
- `fix/short-description`
- `refactor/short-description`
- `chore/short-description`

## PR Requirements

- All tests pass
- No lint violations
- Coverage thresholds maintained
- Small, focused changes preferred
