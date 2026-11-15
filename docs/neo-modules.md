# Neo modules

Les neo modules sont des racines React indépendantes, intégrées dans les pages servies par camap-hx (templates `.mtt`).

Ils sont définis dans `packages/front-core/src/modules/` et enregistrés dans `packages/front-core/src/neo.tsx`.

## Développement

On développe un module React (composant fonctionnel exporté par défaut, interface de props au même niveau) :

```TSX
// packages/front-core/src/modules/myModule/MyModule.module.tsx

import { Box, Typography } from '@mui/material';
import React from 'react';

export interface MyModuleProps {
  message: string;
}

const MyModule = ({ message }: MyModuleProps) => {
  return (
    <Box>
      <Typography variant="h1">My Module</Typography>
      <Typography>{message}</Typography>
    </Box>
  );
};

export default MyModule;
```

Le module doit pouvoir s'afficher seul : on peut le tester avec Storybook (fichier `*.stories.tsx` à côté du module, voir les modules existants). Storybook se lance avec `npm run dev:story` depuis la racine de `camap-ts` (ou `npm run storybook` depuis `packages/front-core`), sur le port `6006`. Pour charger des données de test dans une story, voir [Dataset](./dataset.md).

## Ajout du module dans la bibliothèque de modules

Dans `packages/front-core/src/neo.tsx`, ajouter une entrée dans l'objet `modules` :

- `module` : le composant [importé dynamiquement](https://react.dev/reference/react/lazy) via `React.lazy()`
- `wrapper` (optionnel) : le composant qui encapsule le module. Par défaut `Wrapper` (thème MUI, localisation des dates, `Suspense`). Utiliser `ApolloWrapper` si le module fait des requêtes GraphQL.
- `props` (optionnel) : props par défaut passées au wrapper/module (ex. `{ showFallback: false }` pour ne pas afficher de loader pendant le chargement)

```TSX
// packages/front-core/src/neo.tsx

const modules: Record<string, {
  module: React.LazyExoticComponent<any>;
  wrapper?: React.ComponentType<any>;
  props?: Record<string, any>;
}> = {
  [...]
  myModule: {
    module: React.lazy(() => import('./modules/myModule/MyModule.module')),
    wrapper: ApolloWrapper,
  },
  [...]
};
```

La fonction `createNeoModule(id, moduleName, props)` se charge ensuite de retrouver le module dans cet objet, de créer la racine React (`createRoot`) dans l'élément `id` et de rendre le module dans son wrapper avec les props fusionnées. Si `moduleName` n'existe pas dans `modules`, une erreur `Unknown module` est levée.

## Compiler

`npm run build:front` depuis la racine de `camap-ts`, ou `npm run build` depuis `camap-ts/packages/front-core`.

En développement, `npm run watch` depuis `packages/front-core` recompile automatiquement les fichiers modifiés (configuration `webpack.dev.config.js`).

## Intégrer

Dans une page camap (template `.mtt`) :

```HTML
<div id="my-module-root"></div>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        neo.createNeoModule("my-module-root", "myModule", { message: "Hello world" });
    });
</script>
```

Côté templates Haxe, utiliser la macro `$$neoModule` qui génère ce code.

## Sous le capot

Webpack génère plusieurs bundles :

- un bundle pour le runtime webpack.
- un bundle pour les librairies (`node_modules`).
- un bundle qui permet d'initialiser les modules (`neo.tsx`).
- un bundle par module.

Pour la gestion du cache, Webpack ajoute un `hash` au nom des fichiers, ainsi qu'un manifeste permettant de retrouver le nom du module.

Par exemple :

```JSON
{
  "vendors.js": "http://localhost:3010/neostatic/vendors.f6707523fcb1a365fb97.bundle.js",
  "neo.js": "http://localhost:3010/neostatic/neo.23543be047ffabe240e6.bundle.js",
  "runtime.js": "http://localhost:3010/neostatic/runtime.d95aa87942fbce7747da.bundle.js",
  "3.489d1fb15a97352e8b03.bundle.js": "http://localhost:3010/neostatic/3.489d1fb15a97352e8b03.bundle.js"
}
```

Dans camap-haxe, il existe une méthode `BridgeService.getNeoModuleScripts()` qui permet de récupérer l'url des fichiers js depuis le manifeste.
Cette méthode est également accessible dans les templates via la méthode `getNeoModuleScripts` de la classe `View.hx`.

Les trois bundles (`runtime.js`, `vendors.js`, `neo.js`) doivent être ajoutés à la page HTML, pour que la fonction `createNeoModule` (de `neo.tsx`) soit accessible.

Lors d'un appel à `createNeoModule`, webpack va automatiquement charger les bundles supplémentaires dont il a besoin.

La configuration runtime du front (URLs, clé Mapbox...) n'est pas figée au build : elle est lue dans `window.__APP_CONFIG__`, défini par le fichier `env.js` généré au démarrage du container camap-hx (`camap-hx/entrypoint.sh`). Voir `packages/front-core/src/lib/runtimeCfg.ts`.
