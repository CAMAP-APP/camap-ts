# TypeScript Standard Rules

## Language & Types
- Enable and keep `strict` type-checking; avoid `any` and unsafe casts.
- Exported/public APIs must have explicit types; let local inference work where clear.
- Prefer discriminated unions and enums over string literals when appropriate.

## Code Style
- Use descriptive, full-word names; functions are verbs, variables are nouns.
- Use early returns; keep nesting shallow (≤2–3 levels).
- Handle errors meaningfully; never swallow exceptions without action.
- Keep modules focused; avoid giant files.

## Project Conventions
- Respect each package's `tsconfig*.json`.
- Run and fix ESLint and Prettier using package scripts before committing, if configured.
- Preserve existing indentation and formatting when editing existing files.

## Imports & Structure
- Use absolute or configured path aliases per package `tsconfig`.
- Group imports: std libs, third-party, internal. No unused imports.

## React (front-core)
- Use function components with hooks.
- Type props and state explicitly; avoid `any` in components.
- Memoize expensive computations and components when necessary.

## NestJS (api-core)
- Use DTOs with validation pipes; type all controllers/services.
- Keep modules cohesive; inject dependencies via constructors.
- Handle async/await with proper error boundaries.

## Testing
- Prefer fast, deterministic unit tests.
- Mock I/O and network; avoid flaky tests.
