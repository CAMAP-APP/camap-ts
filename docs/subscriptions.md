# Souscriptions

## Fonctionnalité

Une "souscription" est la _souscription d'un adhérent à un contrat_.

Elle représente l'engagement d'un adhérent à acheter les produits d'un producteur pendant une saison. C'est un mécanisme assez proche d'un _abonnement_.

La commande d'un produit est forcément faite dans le cadre d'une souscription.

## BDD

Les souscriptions sont stockées dans la table `Subscription`.

La relation `Subscription.userId` lie la souscription à un `User`

La relation optionnelle `Subscription.userId2` lie la souscription à un deuxième `User` et permet l'alternance de panier dans les contrats classiques.

La relation `Subscription.catalogId` lie la souscription à un `Catalog` (contrat)

Les champs `startDate` et `endDate` définissent les dates de la souscription qui doivent être "à l'intérieur" des dates du contrat. Une souscription peut être créée en cours d'année, ou interrompue en cours d'année. Il est également possible qu'un adhérent change de souscription en cours d'année ( cependant elles ne peuvent pas se chevaucher dans le temps).

## Code

### Saisie des souscriptions

Les souscriptions peuvent être saisies **par les adhérents** eux-même :
Le frontend est en TS (module `csaCatalog` en _React JS_) et le backend en Haxe (_API REST_, controllers dans `src/controller/api/*` ).

Les souscriptions peuvent aussi être saisies **par les administrateurs** de l'AMAP (avec plus de souplesse) : Tout est en haxe dans ce cas, l'administrateur saisit les souscriptions dans l'onglet "souscriptions" du catalogue. C'est le controller `SubscriptionAdmin` qui intervient à ce moment.

Les administrateurs peuvent saisir et modifier des souscriptions avec plus de souplesse qu'un adhérent, voir le flag `adminMode` dans `SubscriptionService`

### DefaultOrders

Le champs `Subscription.defaultOrders` permet de stocker en JSON une "commande par défaut".

Il est utile pour les **contrats classiques** : c'est là qu'on va stocker la commande de base, dupliquée pour chaque distribution via `Subscription.createRecurrentOrders()`.

Pour les **contrats variables** : C'est là qu'on va stocker la commande par défaut qui sera appliquée si le catalog a `distribMinOrdersTotal>0` (montant minimum à commander par distribution) et que l'adhérent n'a pas saisi de commande. Un cron applique cette commande par défaut dans `Cron.doHour()` tâche `'Default automated orders for CSA variable contracts'`

### checkVarOrders (contrats variables)

La fonction `SubscriptionService.checkVarOrders()` sert à vérifier que la commande soumise remplit les conditions du contrat variable : minimum de commande par distribution (`distribMinOrdersTotal`) ou minimum de commande sur toute la durée du contrat ( `catalogMinOrdersTotal` ).

Dans ce dernier cas, si la souscription a une durée inférieure au contrat, on calcule le montant de commande minimum au prorata de la durée de la souscription via `SubscriptionService.getCatalogMinOrdersTotal()`

### Alternance de paniers (contrats classiques)

Il est possible de gérer une alternance de paniers dans les contrats classiques ( user et user2 de la souscription ).

Dans ce cas, la creation de la souscription va créer un ensemble de `UserOrder` avec un flag `InvertSharedOrder`. Le user et user2 de la souscription sont répercutés dans le user et user2 du `UserOrder`. C'est ensuite la fonction `getWhosTurn()` qui dit quel user peut récupérer la commande.
