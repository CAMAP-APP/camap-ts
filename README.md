# CAMAP

## Introduction

CAMAP est une application web qui facilite la gestion d'une AMAP (_Association pour le maintien d'une agriculture paysanne_)

[Documentation utilisateur](https://wiki.amap44.org/fr/home)

## Architecture

L'application se compose de 3 modules :

-   CAMAP-haxe, codé en [Haxe](https://haxe.org)
-   CAMAP-ts, codé en [Typescript](https://www.typescriptlang.org/)
-   une base de données MySQL 5.7

L'application est installable via Docker ou chez [Scalingo.com](https://www.scalingo.com) via un [buildpack]()

## Documentation technique

-   [Installation avec docker-compose](/docs/install.md)
-   Briques fonctionnelles
    -   [Utilisateurs](/docs/users.md)

## Historique

-   2013 : François Barbut développe une application web pour les AMAP sur son temps libre sous le nom de **Cagette.net**
-   2017 : Il s'associe avec Sébastien Zulke pour créer ALILO.
    Cagette.net gère également des Drives de producteurs ( _mode Boutique_, renommé par la suite _mode Marché_ )
-   2019 : ALILO devient une SCOP. Une collaboration commence avec l'InterAMAP 44 pour améliorer le mode AMAP grâce à des financements publics et un crowdfunding.
-   2022 : L'ensemble des travaux d'amélioration du mode AMAP sont livrés.
-   2023 : ALILO souhaite se concentrer sur le mode marché et ne souhaite plus maintenir le mode AMAP. Le logiciel initial est scindé en 2 logiciels différents pour chacun des 2 modes. C'est ainsi que naît **CAMAP**, dont le code est publié sous license libre.
