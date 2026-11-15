# Migrations et schema de la base de données

## Méthode de travail

Quand on attaque un nouveau chantier, il y a souvent besoin de modifier/ajouter/supprimer des champs ou des tables de la BDD. Pour cela, il faut créer des migrations typeorm qui permettront d'appliquer ces changements sur le différents environnements.

Avant de commencer à travailler, vérifier que votre BDD locale est bien propre : toutes les migrations ont été appliqués (`typeorm migration:show`) , et que `typeorm schema:log` renvoie aucune différence entre les entités et la BDD locale.

Ensuite au fil du développement, on va générer des migrations. On peut générer plusieurs migrations au cours d'un projet, car il n'est pas forcément facile de "viser juste" et de faire une seule migration par projet. Dans tous les cas, **la moindre modification de la BDD doit passer par une migration**, aucune modification manuelle ( ou via /db du projet Haxe ) ne doit être faite, quel que soit l'environnement .

## Se connecter au container nest

En local avec Minikube (cf [installation](./install.md)) :
`kubectl exec -it -n camap deploy/camap-api -- /bin/bash`

Depuis la racine de `camap-ts`, des raccourcis existent : `npm run dev:typeorm:schema:log`, `dev:typeorm:migration:show`, `dev:typeorm:migration:run`, `dev:typeorm:migration:revert` et `dev:typeorm:migration:generate -- NomDeMaMigration`.

⚠️ L'image Docker camap-ts démarre directement `node packages/api-core/dist/main.js` : les migrations **ne sont pas jouées automatiquement** au démarrage. Il faut les lancer à la main dans le pod après un déploiement qui en contient (le script `npm run start:prod` de api-core, qui enchaîne `migration:run` et le lancement de l'app, n'est pas utilisé par l'image).

## Créer une migration

Après avoir modifié des entités, on peut générer une migration en rentrant dans le container :

```
  cd packages/api-core
  npm run typeorm migration:generate -n NomDeMaMigration
```

Cela va générer une migration dans src/migrations/. Vous pouvez compléter le code de la migration si besoin. Attention, dans ce contexte on a pas les classes métier de l'app car les migrations sont des scripts "standalone".

[Documentation de Typeorm](https://typeorm.io/#/migrations)

## Faire tourner les migrations

Pour faire tourner des migrations, il faut aussi se logger dans le container.

```
  cd packages/api-core
  npm run typeorm migration:show // Pour voir les migrations pas encore effecutée ici
  npm run typeorm migration:run // Pour faire tourner les migrations
```

Vous pourrez utiliser `npm i -g typeorm` pour avoir la cli typeorm dans le container
