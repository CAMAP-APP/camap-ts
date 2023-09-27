# Distributions

## Fonctionnalité

Les distributions sont une entité centrale dans CAMAP et représentent une session de distribution de produits, sur une plage horaire donnée, dans un lieu donné.

## BDD

Les distributions sont représentées par les tables `MultiDistrib`, `DistributionCycle` et `Distribution`

`MultiDistrib` est la table principale et représente une seule session de distribution avec le lieu + les dates d'ouverture et de fermeture de commande + les dates de début et de fin de distribution.

`Distribution` représente la participation d'un producteur à une MultiDistrib. Cette table a une relation vers `MultiDistrib.id` et vers `Catalog.id` (le contrat du producteur).

Les champs `Distribution.date` et `Distribution.end` représentent la date de début et de fin de distribution (champs en double avec MultiDistrib, ils pourraient être supprimés )

Les champs `Distribution.orderStartDate` et `Distribution.orderEndDate` représentent la date de début et de fin de commande. **Attention**, ces valeurs peuvent être différentes de celles de MultiDistrib, car chaque producteur peut personnaliser sa "fenêtre temporelle" de commande en fonction de ses contraintes.

`DistributionCycle` permet de stocker le fait qu'on a créé un cycle de distribution ( création de MultiDistrib en masse ). Si une MultiDistrib a été créée via un cycle, la relation `MultiDistrib.distributionCycleId` est peuplée.

## Code

L'entité `MultiDistrib` est représentée par [MultiDistrib.hx](https://github.com/CAMAP-APP/camap-hx/blob/master/src/db/MultiDistrib.hx) en Haxe et par [multi-distrib.entity.ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/shop/entities/multi-distrib.entity.ts) en TS.
