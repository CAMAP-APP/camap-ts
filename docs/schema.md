# Migrations et schema de la base de données

## Méthode de travail

Quand on attaque un nouveau chantier, il y a souvent besoin de modifier/ajouter/supprimer des champs ou des tables de la BDD. Pour cela, il faut créer des migrations typeorm qui permettront d'appliquer ces changements sur le différents environnements.

Avant de commencer à travailler, vérifier que votre BDD locale est bien propre : toutes les migrations ont été appliqués (`typeorm migration:show`) , et que `typeorm schema:log` renvoie aucune différence entre les entités et la BDD locale.

Ensuite au fil du développement, on va générer des migrations. On peut générer plusieurs migrations au cours d'un projet, car il n'est pas forcément facile de "viser juste" et de faire une seule migration par projet. Dans tous les cas, **la moindre modification de la BDD doit passer par une migration**, aucune modification manuelle ( ou via /db du projet Haxe ) ne doit être faite, quel que soit l'environnement .

## Se connecter au container nest

En local avec docker :
`docker-compose run nest /bin/bash`

Sur scalingo :
`scalingo -a api-prod run /bin/bash`

## Créer une migration

Après avoir modifié des entités, on peut générer une migration en rentrant dans le container :

```
  cd packages/api-core
  typeorm migration:generate -n NomDeMaMigration
```

Cela va générer une migration dans src/migrations/. Vous pouvez compléter le code de la migration si besoin. Attention, dans ce contexte on a pas les classes métier de l'app car les migrations sont des scripts "standalone".

[Documentation de Typeorm](https://typeorm.io/#/migrations)

## Faire tourner les migrations

Pour faire tourner des migrations, il faut aussi se logger dans le container.

```
  cd packages/api-core
  typeorm migration:show // Pour voir les migrations pas encore effecutée ici
  typeorm migration:run // Pour faire tourner les migrations
```

Vous pourrez utiliser `npm i -g typeorm` pour avoir la cli typeorm dans le container
