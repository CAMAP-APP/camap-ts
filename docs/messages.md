# Gestion des membres et messagerie

## Fonctionnalités

L'onglet "Membres" permet de gérer et d'inviter des adhérents dans le groupe.

Il permet aussi d'exporter certaines listes de membres, et de gérer la liste d'attente si le groupe est configuré pour cela.

L'onglet "Messagerie" permet d'envoyer des emails à un ensemble de membres, comme un module simple de newsletter intégré à CAMAP.

## BDD

Les membres d'une AMAP sont des `User` reliés à un `Group` par un `UserGroup` ( cf documentation [groupes](./groups.md) ).

Les `User` en liste d'attente sont stockés dans la table `WaitingList`, structurée comme `UserGroup` ( relation vers `User` + relation vers `Group` ).

L'historique de messages envoyés via la messagerie est stocké dans la table `Message`.

## Code

### Messagerie

Le front et le back de la messagerie sont codés en TS.

-   Le backend est géré par le module `messages.module.ts`
-   Le frontend est géré par le composant React `Messages.module.tsx`

L'éditeur de texte wysiwyg est fait avec [Plate](https://platejs.org/) (`platejs` / `@platejs/*`), construit sur [Slate JS](https://www.slatejs.org/). Le code de l'éditeur est dans `packages/front-core/src/modules/messages/editor/`.

### Gestion des membres

Le front et le back de la gestion des membres sont codés en TS ( à part les fiches membres qui sont toujours en Haxe : URLs en `/member/view/$userId` )

-   Le backend est géré par le module `groups.module.ts`
-   Le frontend est géré par le composant React `Members.module.tsx`

### Adhésions à renouveler avec activité sur l'année

La liste « Membres avec adhésions à renouveler et activité sur l'année » sélectionne
les membres du groupe sans adhésion pour la période courante et ayant soit une
commande de quantité strictement positive pour une distribution de cette période,
soit une souscription couvrant une partie de la période. Les catalogues terminés et
les producteurs désactivés ne sont pas exclus de l'historique.

La période court entre deux dates annuelles de renouvellement des adhésions ; sans
date configurée, il s'agit de l'année civile. Le début est inclus et le renouvellement
suivant est exclu, selon l'heure de Paris. La date de distribution compte, quelle que
soit la date de saisie de la commande. Les deux utilisateurs d'un panier partagé sont
retenus s'ils appartiennent encore au groupe. Le statut de producteur ne suffit pas
à constituer une activité comme consommateur.

La liste est disponible dans Membres et dans la messagerie uniquement lorsque la
gestion des adhésions est activée. Le compteur et les destinataires utilisent le
même filtre (`MemberYearListsService`). La liste existante des adhésions à renouveler
conserve son fonctionnement.
