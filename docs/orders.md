# Commandes

## BDD

### Basket

Dans CAMAP, les commandes sont enregistrées avec plusieurs entités : pour chaque distribution (tables `MultiDistrib` et `Distribution`) un adhérent aura un `Basket`.

Cette entité est pratique car elle rassemble sous une même ID la commande d'un utilisateur pour un jour de distribution donné. Cela permet par exemple d'attribuer un numéro de commande via `Basket.num`. Un basket a une relation vers un `User` et vers une `MultiDistrib`.

### UserOrder

A ce basket, sont reliés un ensemble de `UserOrder` qui représente "une ligne" de commande : tel utilisateur a commandé tel produit en telle quantité.

La relation `UserOrder.userId` représente quel user a fait la commande

La relation `UserOrder.userId2` représente éventuellement un deuxième user pour la gestion des paniers alternés

Naturellement, un UserOrder a une relation vers une `Subscription` , une `Distribution` et un `Basket`.

Le `productPrice` est stocké au moment de la saisie de la commande, afin de conservé le prix si il était changé à posteriori dans `Product.price`

Les champs `paid` et `feesRate` ne servent plus.

## Code

Les commandes (`Basket` et `UserOrder`) sont gérées par le `OrderService` en haxe
