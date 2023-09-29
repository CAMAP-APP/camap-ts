# Neo modules

## Développement

On développe un module React :

```JSX
// .src/MyModuleProps.tsx

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

que l'on peut tester avec [Storybook](./storybook.md).

// TODO: hot reload sur localhost ?

## Ajout du module dans la bibliothèque de modules

Dans `./src/neo.tsx` :

- [importer dynamiquement](https://fr.reactjs.org/docs/code-splitting.html) le module [1]
- initialiser le module dans la fonction `createNeoModule` [2]

```JSX
// ./src/neo.tsx

[...]
const MyModule = React.lazy(() => import('./MyModule')); // [1]
[...]

export const createNeoModule = (id: string, moduleName: string, props?: any) => {
  const renderModule = () => {
    if (moduleName === 'myModule') { // [2]
      return (
        <AWrapper>
          <MyModule {...props} />
        </AWrapper>
      );
    }

    throw new Error(`Unknown module: ${moduleName}`);
  };

  const container = document.getElementById(id);
  const root = createRoot(container);
  root.render(<>{renderModule()}</>, document.getElementById(id));
};
```

## Compiler

`npm run build:front` depuis la racine de `camap-ts` ou `npm run build:neo` depuis `camap-ts/packages/front-core`.
Note : pour tester l'intégration, il est possible d'utiliser la template `debug/neo.mtt` servie par la route `/debug/neo`

## Intégrer

Dans une page camap :

```HTML
<div id="my-module-root"></div>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        neo.createNeoModule("my-module-root", "myModule", { message: "Hello world" });
    });
</script>
```

## Sous le capot

Webpack genère plusieurs bundle :

- un bundle pour le runtime webpack.
- un bunde pour les librariries de (node_modules).
- un bundle qui permet d'initialiser les modules.
- un bundle par module.

Pour la gestion du cache, Webpack ajoute un `hash` au nom des fichiers aisin qu'un manifeste permettant de retrouver le nom du module.

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
Cette méthode est également accessible dans les templates via la méthode `getNeoModuleScripts` de le classe `View.hx`.

Les trois bundles (`runtime.js`, `vendor.js`, `neo.js`) doivent être ajoutés à la page HTML, pour que la fonction `createNeoModule` (de `neo.tsx`) soit accessible.

Lors d'un appel à `createNeoModule`, webpack va automatiquement charger les bundles supplémentaires dont il a besoin.
