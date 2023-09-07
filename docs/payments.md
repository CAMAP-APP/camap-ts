# Paiements

## Fonctionnalité

La gestion des paiements de CAMAP permet de suivre les paiements des adhérents des AMAP.

Son mode de fonctionnement est inspiré de la [comptabilité en partie double](https://fr.wikipedia.org/wiki/Comptabilit%C3%A9_en_partie_double) utilisée par toutes les entreprises :

-   des lignes représentent des **dettes** (_par exemple quand l'adhérent souscrit à un contrat, il doit payer une certaine somme pour la totalité des produits commandés_)
-   des lignes représentent des **paiements** ( _par exemple lorsqu'un adhérent paye l'intégralité ou une partie de sa souscription_ )

Le **solde** d'un adhérent correspond à l'addition de toutes ces opérations.

L'objectif est que chaque membre aie un solde à zéro, ce qui veut dire qu'il n'a ni dettes (ou _ardoise_), ni crédit (ou _avoir_) auprès des producteurs ou de l'AMAP.

## BDD

La table `Operation` a 2 relations vers `User.id` et `Group.id`. Les opérations n'existent que dans le contexte d'un groupe, il n'y a aucune porosité entre les groupes, un utilisateur a autant de soldes que de groupes dont il est membre.

Le champs `type` correspond à l'enum [OperationType](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/payments/OperationType.ts) et définit le type d'opération

```
export enum OperationType {
  Order,              //Non utilisé sur CAMAP
  SubscriptionTotal,  //Dette correspondant au total à payer d'une souscription.
  Payment,            //Opération de paiement
  Membership,         //Dette correspondant à une adhésion à payer à l'AMAP
}
```

Le champs `amount` représente le montant de l'opération, il est négatif pour les opérations de dette (_SubscriptionTotal, Membership_) et positif pour les opérations de paiement.

Le champs `pending`, s'il est à `true` veut dire que le paiement est en attente de vérification (_comme un paiement en ligne non finalisé, ou un virement/paiement en liquide qui doit être confirmé par un administrateur_). Ce champs n'est plus utilisé dans CAMAP, puisque les administrateurs saisissent eux même les paiements, on considère donc qu'il est certain que le paiement a été fait.

La relation vers `Basket.id` n'est pas utilisée dans CAMAP (paiement pour un seul panier)

La relation vers `Subscription.id` est utilisée pour les opérations de type `SubscriptionTotal` pour dire à quelle souscription correspond cette dette.

La relation `Relation` référence une autre opération. Elle est utilisée pour les opérations de paiement pour indiquer quelle dette ce paiement honore.

Le champs `data` permet de stocker des informations additionnelles en JSON en fonction du type de l'opération. Il sert par exemple à préciser quel moyen de paiement a été utilisé pour un paiement. Dans de futurs développements, il pourra servir à stocker une référence de paiement en ligne, de paiement TPE, de [mandat RUM](https://www.hellobank.fr/lexique/reference-unique-de-mandat-rum/) ou de virement.

## Code

L'entité `Operation` est représentée par [Operation.hx](https://github.com/CAMAP-APP/camap-hx/blob/master/src/db/Operation.hx) en Haxe et par [group.entity.ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/payments/entities/operation.entity.ts) en TS.

Les fonctions de base de paiement sont gérées dans `PaymentService`, mais on en trouve aussi dans `SubscriptionService` qui gère les souscriptions aux contrats.

Le calcul des soldes [se fait dans le PaymentService](https://github.com/CAMAP-APP/camap-hx/blob/master/src/service/PaymentService.hx#L343)

Exemple : [on voit ici comment le SubscriptionService](https://github.com/CAMAP-APP/camap-hx/blob/master/src/service/SubscriptionService.hx#L1003) met à jour (ou créé) l'opération de paiement avec comme `amount` le total de la souscription obtenu via `subscription.getTotalPrice()`

Exemple : [saisie d'une opération de paiement](https://github.com/CAMAP-APP/camap-hx/blob/master/src/controller/SubscriptionAdmin.hx#L451) dans le controller d'administration des souscriptions `SubscriptionAdmin.hx`
