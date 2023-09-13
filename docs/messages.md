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

L'éditeur de texte wysiwyg est fait avec [Slate JS](https://www.slatejs.org/)

### Gestion des membres

Le front et le back de la gestion des membres sont codés en TS ( à part les fiches membres qui sont toujours en Haxe : URLs en `/member/view/$userId` )

-   Le backend est géré par le module `groups.module.ts`
-   Le frontend est géré par le composant React `Members.module.tsx`
