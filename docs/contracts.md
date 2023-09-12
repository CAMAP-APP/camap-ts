# Contrats

## Fonctionnalité

Les contrats ( aussi appelés "Catalogues" dans CAMAP ) rassemblent les produits d'un producteur, vendus au cours d'une même saison.

En effet, un contrat a une **date de début** et une **date de fin**, correspondant à une saison ( généralement une année ).

A chaque contrat, correspond un certain nombre de **distributions** qui doivent forcément avoir lieu dans la fenêtre temporelle définie dans le contrat.

Les contrats peuvent être de type **classique** ( contrat AMAP classique, `TYPE_CONSTORDERS` dans le code ) ou de type **variable** ( Permet une variation des commandes de l'adhérent au fil des distributions, `TYPE_VARORDER` dans le code ).

Le type du contrat va beaucoup influencer sur le mode de fonctionnement des commandes, et va influer sur la configuration du contrat.

Le fonctionnement des contrats et des souscriptions est assez complexe, il est recommandé de lire la [documentation utilisateur](https://wiki.amap44.org/) en premier lieu.

## BDD

Les contrats sont gérés par la table `Catalog`.

La relation `Catalog.groupId` définit à quelle AMAP appartient le contrat.

La relation `Catalog.userId` définit qui est le coordinateur principal du contrat. ( Cela n'empêche pas que plusieurs personnes puissent avoir les droits sur ce contrat, stockés dans `UserGroup.rights` )

La relation `Catalog.vendorId` définit qui est le producteur

Les champs `percentageValue` et `percentageName` ne servent plus. (permettait d'ajouter des frais sur les commandes en plus du prix producteur)

## Code

### Personnalisation de la fenêtre temporelle de commande

Il est recommandé de [la doc des distributions](./distributions.md) afin d'avoir en tête les différentes tables qui entrent en jeu, il est important d'avoir bien compris le rôle des tables `MultiDistrib` et `Distribution`.

Pour n'importe quel type de commande, CAMAP gère toujours une période pendant laquelle il est possible de commander. Par défaut, ces dates sont stockées dans `MultiDistrib.ordersStartDate` et `MultiDistrib.ordersEndDate`.

Cependant, il est possible de personnaliser cette fenêtre de temps pour chaque contrat, via les champs `Catalog.orderStartDaysBeforeDistrib` et `Catalog.orderEndHoursBeforeDistrib` que l'ont saisi à la création du contrat.

Si ces champs sont définis, lorsque le catalogue participe à une distribution ( dans `DistributionService.participate()` ), on va personnaliser la date d'ouverture et de fermeture de commande, et les stocker dans `Distribution.orderStartDate` et `Distribution.orderEndDate`. Ce sont ces champs au final qui vont être pris en compte par le code pour savoir si un adhérent peut commander ou pas.

### Absences ( contrats variables )

Il est possible de définir une **plage d'absences** autorisée afin de permettre aux adhérents de pouvoir être absent lors de certaines distributions.

Le nombre maximum d'absences est stocké dans `Catalog.absentDistribsMaxNb` , et la plage de temps pendant laquelle ces absences sont possibles est définie par `Catalog.absencesStartDate` et `Catalog.absencesStartDate`.

C'est le `AbsencesService` (haxe) qui gère les absences. Quand un adhérent prend une souscription, ses dates d'absences sont dans `Subscription.absentDistribIds` ( ids de Distribution sérialisées )
