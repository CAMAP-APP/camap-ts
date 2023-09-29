# Tests

## Dataset

[Mettre à jour le dataset](./dataset.md)

[Utiliser le dataset dans les tests](../test/dataset/dataset.md)

## Commandes

`npm run test ['<filtre>']` : exécute les test unitaires.

`npm run test:e2e ['<filtre>']` : exécute les test end to end.

`npm run test:cov` : exécute le coverage.

- filtre : [[doc jest]](https://jestjs.io/docs/en/cli#jest-regexfortestfiles)

## Test e2e

[Template de test e2e](./template-test-e2e.md)

## Environnement

Les tests sont éxécutés dans l'environnement NODE_ENV=test [[doc jest]](https://jestjs.io/docs/en/environment-variables#node_env)
Ce qui permet d'initialiser Nest et TypeOrm à partir du fichier .env.test

## Debugger un test

Par exemple, pour débugger les tests e2e Orders il faut lancer la commande suivante :

`node --inspect-brk node_modules/.bin/jest --runInBand --config ./test/jest-e2e.json Orders`

- Met un `debugger;` dans le code de votre test à debugger.
- Ouvre chrome://inspect et Click the Configure button and ensure your target host and port are listed.
- Ouvre la bonne target.
- Là le test est en pause, il faut faire Play script execution (F8) pour lancer le test.
- Le test va se pauser à la ligne du `debugger;`. Tu peux ajouter des breakpoints si tu veux.
