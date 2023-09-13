# Adhésions

## Fonctionnalité

Les gestion des adhésions permet de suivre les adhésions des membres d'une association.

La fonctionnalité est activée depuis l'onglet paramètres du groupe.

## BDD

Le champs `Group.hasMembership` gère l'activation/désactivation de la gestion des adhésions dans le groupe.

Le champs `Group.membershipRenewalDate` stocke la date annuelle à laquelle les adhésions doivent être renouvellées.

Le champs `Group.membershipFee` stocke le montant de la cotisation annuelle (optionnel).

La table `Membership` stocke les adhésions des membres : elle a naturellement une relation vers `User` et `Group`. Un membre peut avoir plusieurs `Membership` , un par année d'adhésion.

Le champs `Membership.year` stocke l'année pour laquelle l'adhésion est valable.

La relation `Membership.operationId` fait le lien avec les operations de paiement de l'adhésion ( voir doc [paiements](./payments.md) )

## Code

Le front et le back sont codés en TS :

-   le backend est géré par `membership.resolver.ts` et `membership.service.ts` dans le module "groups"
-   Le frontend est géré par le composant React `MembershipDialog.module.tsx`
