# Utilisateurs

## fonctionnalité

Dans CAMAP un utilisateur représente un foyer entier, il est donc possible d'attribuer 2 emails et 2 noms-prénoms à un même utilisateur.

Il possible de se connecter à l'application avec le premier email ou le second email du compte.

Le champs email est unique, il ne peut donc pas y avoir 2 utilisateurs avec le même email.

un utilisateur peut être membre d'un ou plusieurs groupes (AMAP).

En tant que membre d'un groupe, il pourra souscrire à des contrats et gérer ses commandes de produits.

Il peut posséder des droits d'administration différents pour chacun des groupes dont il est membre.

## BDD

Les utilisateurs sont gérés par la table `User`.

Le champs `rights` est de type "Enum flags", c'est à dire qu'il stocke dans un integer une série de booléens correspondant à toutes les valeurs d'un Enum. Concrètement ça permet, par exemple, de stocker des droits ou des options. Cette fonctionnalité vient à l'origine de record-macros ( ORM Haxe ) et [a été portée en TS](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/common/haxeCompat.ts).

Le champs `rights` permet de définir si le User est superadmin, c'est à dire administrateur de toute l'instance CAMAP. ( `user.isAdmin()` en haxe)

Le champs `flags` stocke les options de notification du User.

La nature des autres champs est assez évidente et est documentée directement dans le code.

## Code

L'entité `User` est représentée par [User.hx](https://github.com/CAMAP-APP/camap-hx/blob/master/src/db/User.hx) en Haxe et par [user.entity.ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/users/models/user.entity.ts) en TS.

## Authentification

Un utilisateur se connecte avec son email (`User.email` ou `User.email2`) et son mot de passe.

Le champs `User.pass` n'est plus utilisé ( ancien système d'authentification, celui de camap-hx)

Le champs `User.pass2` stocke le mot de passe encrypté, utilisé par camap-ts.

Si un mauvais mot de passe est donné plusieurs fois d'affilée, [un mécanisme de _fail2ban_ entre en jeu](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/auth/auth.service.ts#L51) et bloque l'IP de l'utilisateur temporairement.

L'authentification est très liée aux possibilités données par les frameworks web utilisés, il y a donc 2 systèmes d'authentification qui fonctionnent en même temps, puisqu'il y a 2 applications techniquement.

Plus concrètement, [le login se fait via camap-ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/auth/auth.service.ts), qui "hacke" camap-hx pour loguer l'utilisateur sur camap-hx.

**Pour camap-hx** : un cookie `sid` ( Session Id ) est posé et correspond à une session stockée dans la table `Session`. Si la session à une ID dans le champs `user` , l'utilisateur correspondant est connecté.

L'utilisateur courant est récupéré via `app.user` dans tous les controllers, ou `App.current.user` ailleurs.

**Pour camap-TS** : la [méthode JWT](https://fr.wikipedia.org/wiki/JSON_Web_Token) est utilisée pour l'authentification. Lorsque l'utilisateur se connecte, camap-ts "hacke" le fonctionnement de camap-hx en mettant le userID dans `Session.user`.

L'utilisateur courant est récupéré via un décorateur dédié en entête des fonctions de controllers ou de resolvers : `@CurrentUser() currentUser: UserEntity`

## Accès à un groupe

Pour savoir à quel groupe un utilisateur est connecté, il faut aller chercher `amapId` dans `Session.data`.

[Exemple de code ici](https://github.com/CAMAP-APP/camap-hx/blob/master/src/controller/Main.hx#L77) dans le controller qui gère l'URL `/home`.

## Suppression des comptes inactifs

La méthode `UserService.cleanUsers()` ( en TS ) supprime les utilisateurs qui ne se sont pas connectés depuis 2 ans ( compatibilité avec la RGPD ), après plusieurs relances par email.

Si le compte ne se reconnecte pas, il est supprimé et ses commandes passées sont attribuées à un utilisateur par défaut (`deleted@camap.tld`) afin que l'historique de commande des AMAP ne soit pas effacé.
