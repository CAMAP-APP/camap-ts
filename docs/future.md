# Maintenance et pérénnité du logiciel sur le long terme

Cette page regroupe différents conseils sur la maintenance long terme de CAMAP.

La plupart de ces travaux à mener sont peu compréhensibles par des non techniciens, mais sont indispensable si l'ont souhaite que CAMAP tienne dans le temps, sans sombrer sous des tonnes de dette technique.

## Migration vers JS/TS

Même si le compilateur [Haxe](https://haxe.org/download/) continue à être maintenu, ses applications pour le web ne sont plus maintenues. Les nouvelles évolutions concernent plutôt le champs du jeu vidéo multiplateforme. De même, le runtime [Neko](https://nekovm.org/) n'est plus maintenu.

Il faut donc considérer sérieusement de poursuivre l'effort de migration vers JS/TS même si cela demande un effort considérable.

( Une piste alternative avait été étudiée via [une compilation PHP du code Haxe](https://haxe.org/manual/target-php-getting-started.html) mais n'a pas été poursuivie. )

Passer [sur une stack plus connue](https://trends.google.com/trends/explore?date=now%201-d&q=%2Fm%2F0dbjtf,%2Fm%2F02p97,%2Fm%2F0n50hxv&hl=fr) permet un accès plus facile aux ressources et aux compétences de développement.

Les prochains projets à mener pourraient être :

-   Finir de traduire en TS [le code Haxe compilé en JS](https://github.com/CAMAP-APP/camap-hx/tree/master/js)
-   Front : Remplacer les interfaces en templates mtt par des interfaces en React
-   Back : Ré-écrire les modules en TS petit à petit, et en profiter pour bien les sécuriser avec des suites de tests unitaires ou e2e. Lorsqu'on retire une feature du code Haxe pour la récréer en TS, [on peut toujours utiliser un pont pour que le code Haxe appelle des fonctions sur le serveur TS](https://github.com/CAMAP-APP/camap-hx/blob/master/src/service/BridgeService.hx).
-   Supprimer au passage les champs de base de données non utilisés, vestiges de fonctionnalités disparues.

## Dates FR et UTC dans la BDD

Camap-haxe est prévu pour fonctionner sur un serveur avec l'heure française. Les dates stockées dans les tables par le code Haxe sont donc des dates Françaises ( UTC+1 en hiver , UTC+2 en été ).

A l'inverse, camap-ts fonctionne avec des dates UTC ce qui facilite l'internationalisation des apps, [mais complique les interactions avec l'app Haxe.](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/shop/entities/multi-distrib.entity.ts#L99)

Dans le cadre de la migration vers JS/TS, il faudrait basculer sur des dates UTC dans l'ensemble de la base de données

## ORM et migrations

Actuellement quasiement toutes les entités (tables) de la BDD sont écrites à la fois en TS , à la fois en Haxe, ce qui rend la gestion des évolutions particulièrement fastidieuse et compliquée.

Lorsqu'on porte une fonctionnalité de Haxe vers TS, il devient possible de supprimer l'entité en Haxe.

Typeorm, permet la rédaction de [migrations](https://orkhan.gitbook.io/typeorm/docs/migrations) ce qui simplifie grandement la gestion de différentes instances.
Chaque mise à jour du schéma de BDD de CAMAP devrait s'accompagner d'une migration.

## Encodage UTF8 vs ISO

camap-haxe ne gère pas vraiment UTF-8, c'est pourquoi la base de données contient des chaines UTF-8, mais avec un _characterset_ et une _collation_ MySQL "ISO" (_latin1_swedish_ci_). Les pages web s'affichent cependant correctement en UTF-8 dans le navigateur.

De l'autre côté, camap-ts fonctionne par défaut en UTF-8.

Malheureusement, il n'est pas possible de passer à un _characterset_ et une _collation_ de type _utf8mb4_general_ci_ car cela ne fonctionne pas avec camap-haxe.

## Dépendances JS et autres

Le monde Javascript / Node Js / Typescript évolue très vite, ce qui nécéssite de mettre à jour les dépendances régulièrement, au moins sur les briques principales ( _Nest JS, TypeORM, React, Appolo ...etc_) sinon l'application risque de devenir obsolète et difficile à maintenir.

Côté BDD, la version 5.7 de MySQL commence à être ancienne, une évolution vers des versions plus récentes serait bénéfique. ( Si les vieux drivers MySQL de Neko continuent de fonctionner )
