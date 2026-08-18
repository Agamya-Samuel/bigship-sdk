# Contributing to bigship-sdk

## Development Setup

```bash
git clone https://github.com/Agamya-Samuel/bigship-sdk.git
cd bigship-sdk
npm install
```

## Monorepo Structure

```
packages/sdk/       The published @agamya/bigship-sdk package
apps/playground/    Interactive playground (Next.js)
apps/docs/          Documentation site (Astro + Starlight)
docs/               Guide and API documentation source
examples/           Runnable code examples
tooling/            Build tooling (TypeDoc config, etc.)
```

## Common Commands

```bash
# Build
npm run build:sdk           # Build the SDK
npm run build:playground    # Build the playground
npm run build               # Build everything

# Test
npm test                    # Run SDK unit tests
npm run test:integration    # Run integration tests (requires credentials)

# Type check
npm run typecheck           # Type check the SDK

# Docs
npm run docs:generate       # Generate API reference from TypeDoc
```

## Making Changes

### SDK (`packages/sdk/`)

1. Create a branch from `main`
2. Make your changes in `packages/sdk/src/`
3. Add or update tests in `src/__tests__/`
4. Run `npm test -w packages/sdk` to verify
5. Run `npm run typecheck` to check types
6. Run `npm run build:sdk` to verify the build

### Playground (`apps/playground/`)

1. The playground consumes the SDK as a workspace dependency
2. Run `npm run build:sdk` first if you changed SDK code
3. Run `npm run dev -w apps/playground` for local development
4. The playground imports from `@agamya/bigship-sdk` — do not import internal SDK paths

### Documentation (`apps/docs/`)

1. Human-authored content goes in `apps/docs/src/content/docs/`
2. API reference is generated — do not edit `apps/docs/src/content/docs/api/` manually
3. Run `npm run docs:generate` to regenerate API docs after SDK changes

### Examples (`examples/`)

1. Examples are organized by category: `node/`, `workflows/`, `frameworks/`
2. All examples import from `@agamya/bigship-sdk` (the npm package specifier)
3. CI validates that examples compile — keep imports correct

## Code Style

- TypeScript with `strict: true`
- Zod for runtime validation
- No comments unless necessary
- Follow existing patterns in the codebase

## Pull Requests

1. Keep PRs focused — one feature or fix per PR
2. Ensure CI passes (type check, tests, build)
3. Update CHANGELOG.md in `packages/sdk/` if changing the SDK public API
4. Update documentation if adding new features

## Commit Messages

Use conventional commit format:

```
feat: add warehouse pagination support
fix: handle null response in trackShipment
docs: update B2C flow guide
chore: update dependencies
```

## Reporting Issues

- [GitHub Issues](https://github.com/Agamya-Samuel/bigship-sdk/issues)
- Include reproduction steps, expected vs actual behavior
- Include SDK version and Node.js version

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.
