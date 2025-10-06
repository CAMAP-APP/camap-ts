# Neo modules (front-core)

- Author modules as React function components exported as default. Define a `Props` interface alongside.
- Use dynamic import with `React.lazy(() => import('./MyModule'))` in `src/neo.tsx`.
- Register the module name in `createNeoModule` and wrap with `AWrapper` when rendering.
- Keep module boundaries clean: inputs via props only; no globals.
- Build via `npm run build:neo` (from `front-core`) or `npm run build:front` (from `camap-ts` root).
- Ensure the module can render independently (e.g., with Storybook).
