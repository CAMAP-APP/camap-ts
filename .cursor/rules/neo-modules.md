# Neo Modules

## Structure
- React function components with default export
- Define `Props` interface alongside component
- Clean module boundaries: props only, no globals

## Integration
- Dynamic import: `React.lazy(() => import('./MyModule'))`
- Register in `createNeoModule` with `AWrapper`
- Must render independently (Storybook compatible)

## Build
- `npm run build:neo` (from front-core)
- `npm run build:front` (from camap-ts root)
