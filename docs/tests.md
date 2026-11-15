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

### Prérequis

- Node 20 (version de `package.json`) et un `npm install` à la racine. Le `postinstall` installe les packages avec `--ignore-scripts` puis recompile `bcrypt` pour la plateforme courante.
- `camap-common` doit être buildé : `npm run build:common` depuis la racine.
- Tests e2e : `npm run test:e2e` compile d'abord les templates de mails (`pretest:e2e` → `mails/dist`), puis a besoin d'un MySQL 8 tel que décrit dans `.env.test` (`localhost:3306`, `root`/`root`, base `test`) :
  - **sans** `STRICT_TRANS_TABLES` dans `sql_mode` (cf. `mysql/my.cnf`), sinon le générateur de dataset échoue (`Field 'lang' doesn't have a default value`) ;
  - le schéma est recréé à partir des entités au lancement de chaque suite (`initTestApp`) : **ne jamais pointer `.env.test` vers une base contenant des données utiles**.

### Lancer tous les tests dans Docker

`docker-compose.test.yml` fournit un MySQL 8 configuré et un conteneur Node 20 qui copie les sources (le dépôt et les `node_modules` de l'hôte ne sont pas utilisés), puis lance les tests unitaires api-core, les tests e2e et les tests front-core (`src/utils`) :

```bash
docker compose -f docker-compose.test.yml run --rm tests
docker compose -f docker-compose.test.yml down
```

Les `node_modules` sont conservés dans des volumes Docker pour accélérer les lancements suivants (`down -v` pour les supprimer).

### Configuration Jest d'api-core

Jest 27 nécessite quelques adaptations, présentes dans `jest.config.js` et `test/jest-e2e.json` :

- `modulePaths` : résolution des imports absolus `src/...` ;
- `test/jest-node-environment.js` : environnement qui expose les globals de Node 20 (`ReadableStream`, `Blob`…) utilisés par `undici` ;
- `moduleNameMapper` : Jest 27 ignore le champ `exports` des `package.json` ; `axios` (build CommonJS) et le binaire de `sharp` sont donc mappés explicitement.

### front-core

Jest 28 avec `jest-environment-jsdom`. Les specs de `src/components` sont antérieures à la migration MUI v5 / React 18 et ne passent plus ; elles restent à réécrire.
