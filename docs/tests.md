# Tests

Le code TS utilise Jest pour faire des tests unitaires ou e2e ( end to end ).

Il y a eu des tests en Haxe mais qui sont tombés en désuétude.

## Commandes

Les commandes se lancent depuis `packages/api-core` (le `package.json` racine ne définit pas de script `test`). `packages/front-core` dispose aussi de ses propres tests Jest (`npm run test`, `npm run test:watch`).

`npm run test ['<filtre>']` : exécute les test unitaires.

`npm run test:e2e ['<filtre>']` : exécute les test end to end.

`npm run test:cov` : exécute le coverage.

filtre : [doc jest](https://jestjs.io/docs/en/cli#jest-regexfortestfiles)

## Environnement

Les tests sont éxécutés dans l'environnement `NODE_ENV=test` [(documentation de Jest)](https://jestjs.io/docs/en/environment-variables#node_env)

Ce qui permet d'initialiser Nest et TypeOrm à partir du fichier .env.test
