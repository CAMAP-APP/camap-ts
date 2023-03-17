# CAMAP

## Introduction

CAMAP est une application web qui facilite la gestion d'une AMAP (_Association pour le maintien d'une agriculture paysanne_)

## Architecture

L'application se compose de 3 modules :
- CAMAP-haxe, codé en [Haxe](https://haxe.org)
- CAMAP-ts, codé en [Typescript](https://www.typescriptlang.org/)
- une base de données MySQL 5.7

L'application est installable via Docker (cf ci-dessous) ou chez [Scalingo.com](https://www.scalingo.com) via un [buildpack]()

## Documentations

- [Documentation développeur](/docs/readme.md)
- Documentation utilisateur

## Installation avec docker-compose

Ce mode d'installation est recommandé pour une installation locale sur un poste de développement.

Clonez les 2 repository côte à côte

Dans `CAMAP-ts/docker-compose` lancez les containers avec `docker-compose up -d`

### CAMAP-haxe backend

- Installer lix (équivalent de npm+nvm pour Haxe) : `npm i -g lix`
- Aller dans `CAMAP-haxe/backend`
- `lix scope create`
- Installer le compilateur Haxe 4.0.5 : `lix install haxe 4.0.5`
- `lix use haxe 4.0.5`
- Installer les dépendances du backend Haxe : `lix download`
- compiler le backend haxe : `haxe build.hxml -D i18n_generation`
- Aller dans `CAMAP-haxe` et copier `config.dist.xml` pour le renommer `config.xml`
- dans `lang/master`, créer un dossier `tmp` et donner les droits en écriture ( `chmod 777 tmp` )
- Accédez à `localhost` dans votre navigateur, une erreur doit s'afficher : `Error : INSERT INTO Error (date,error,ip,userAgent,url)...`. C'est normal, les tables de la base de données ont été créées.
- Rafraîchissez la page, vous devez avoir une erreur : `Unable to load ressources from CAMAP-ts.`
- Le backend Haxe est bien là, il a juste besoin de CAMAP-ts pour fonctionner.

### CAMAP-haxe frontend

- Aller dans `CAMAP-haxe/frontend`
- `lix scope create`
- `lix use haxe 4.0.5`
- Installer les dépendances du frontend Haxe : `lix download`
- `npm i`
- compiler le frontend haxe : `haxe build.hxml`

### CAMAP-TS
- Aller dans `CAMAP-ts`
- Créer un fichier `.env` à partir de `.env.sample`
- Installer les dépendances : `npm i`
- Tout compiler : `npm run build`
- Relancez éventuellement le container CAMAP-ts en allant dans `/docker-compose` avec la commande `docker-compose restart camap-nest`

### Fin de l'installation
- CAMAP-haxe est disponible sur `localhost` , CAMAP-ts est disponible sur `localhost:3010`
- Aller sur `localhost/install` pour finaliser l'installation



## Historique

 - 2013 : François Barbut développe une application web pour les AMAP sur son temps libre sous le nom de **Cagette.net**
 - 2017 : Il s'associe avec Sébastien Zulke pour créer ALILO.
 Cagette.net gère également des Drives de producteurs ( *mode Boutique*, renommé par la suite *mode Marché* )
 - 2019 : ALILO devient une SCOP. Une collaboration commence avec l'InterAMAP 44 pour améliorer le mode AMAP grâce à des financements publics et un crowdfunding. 
 - 2022 : L'ensemble des travaux d'amélioration du mode AMAP sont livrés.
 - 2023 : ALILO souhaite se concentrer sur le mode marché et ne souhaite plus maintenir le mode AMAP. Le logiciel initial est scindé en 2 logiciels différents pour chacun des 2 modes. C'est ainsi que naît **CAMAP**, dont le code est publié sous license libre. 

