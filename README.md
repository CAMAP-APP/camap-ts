# CAMAP

## Introduction

CAMAP est une application web qui facilite la gestion d'une AMAP (_Association pour le maintien d'une agriculture paysanne_)

[Documentation utilisateur](https://wiki.amap44.org/fr/home)

## Architecture

L'application se compose de 3 modules :

-   CAMAP-haxe, codé en [Haxe](https://haxe.org)
-   CAMAP-ts, codé en [Typescript](https://www.typescriptlang.org/)
-   une base de données MySQL 5.7

## Documentation technique

-   Installation
    -   [docker-camap](https://github.com/CAMAP-APP/camap-docker) pour une installation simplifiée (avec reverse proxy Traefik)
    -   [Avec docker-compose](/docs/install.md) (ne fonctionne plus, utiliser docker-camap pour une installation locale)
    -   Avec un [buildpack](https://github.com/CAMAP-APP/neko-scalingo-buildpack-camap) chez [Scalingo](https://www.scalingo.com) (probablement non fonctionnelle)
-   Briques fonctionnelles
    -   [Utilisateurs](/docs/users.md)
    -   [Groupes](/docs/groups.md)
    -   [Distributions](/docs/distributions.md)
    -   [Paiements](/docs/payments.md)
    -   [Produits](/docs/products.md)
    -   [Contrats](/docs/contracts.md)
    -   [Commandes](/docs/orders.md)
    -   [Souscriptions](/docs/subscriptions.md)
    -   [Permanences](/docs/volunteers.md)
    -   [Gestion des membres et Messagerie](/docs/messages.md)
    -   [Adhésions](/docs/membership.md)
-   Briques techniques
    -   [Emails](/docs/emails.md)
    -   [Fichiers de configuration](/docs/conf.md)
    -   [Thème](/docs/theme.md)
    -   [Crons](/docs/crons.md)
    -   [Files](docs/files.md)
    -   [Traduction / i18n](docs/i18n.md)
    -   [Tests en TS](docs/tests.md)
    -   [Génération de datasets pour le dev](/docs/dataset.md)
    -   [Gestion des erreurs en GraphQL](/docs/error-handling.md)
    -   [Templates](/docs/templates.md)
-   [Maintenance et pérénnité du logiciel sur le long terme](docs/future.md)

## Historique

-   2013 : François Barbut développe une application web pour les AMAP sur son temps libre sous le nom de **Cagette.net**
-   2017 : Il s'associe avec Sébastien Zulke pour créer ALILO.
    Cagette.net gère également des Drives de producteurs ( _mode Boutique_, renommé par la suite _mode Marché_ )
-   2019 : ALILO devient une SCOP. Une collaboration commence avec l'InterAMAP 44 pour améliorer le mode AMAP grâce à des financements publics et un crowdfunding.
-   2022 : L'ensemble des travaux d'amélioration du mode AMAP sont livrés.
-   2023 : ALILO souhaite se concentrer sur le mode marché et ne souhaite plus maintenir le mode AMAP. Le logiciel initial est scindé en 2 logiciels différents pour chacun des 2 modes. C'est ainsi que naît **CAMAP**, dont le code est publié sous license libre, sous la houlette de l'[InterAMAP 44](https://amap44.org).
