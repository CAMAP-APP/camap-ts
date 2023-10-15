# Fichiers de configuration

## Haxe

La configuration de l'application se fait dans le fichier `config.xml` à la racine.

`lang` : Langue par défaut ( format à 2 lettres : `fr`)

`langs` : Langues de l'app disponibles séparés par une virgule (`fr,en,es,de`)

`langnames` : Libellé des langues de l'app Langues.

`name` : Nom de l'application.

`webmaster_email` : Email de l'administrateur de l'app. Utilisé par le cron qui envoie chaque nuit la liste des erreurs Haxe enregistrées dans la table `Error`

`database` : chaine de configuration de l'accès à la base MySQL sous la forme `mysql://$user:$password@$host/$databaseName`

`sqllog` : affiche un log des opérations SQL en bas de chaque page pour aider à debugger le code Haxe.

`debug` : Mettre 1 en environnement de dev, et 0 en environnement de prod. Cela permet au développeur de changer le comportement du code entre les 2 environnements ( `if (App.config.DEBUG)...`).

Cela affecte aussi le système de template, lorsque DEBUG=1 les templates sont compilés à chaque affichage de page (`.mtt->.mtt.n`) ce qui permet de voir les modification en direct. En production, les templates compilés sont directement utilisés (`.mtt.n`) pour gagner en performance. [cf Performance mode de templo](https://github.com/ncannasse/templo#optimized-mode)

`cache` : active le [cache de code Neko](https://api.haxe.org/neko/Web.html#cacheModule) pour gagner en performance. (_documentation manquante sur cette fonctionnalité de Neko, laisser à 0_)

`cachetpl` : Active le cache de [templo](https://github.com/ncannasse/templo), le moteur de templates. (_documentation manquante sur cette fonctionnalité de Templo, laisser à 0_)

`maintain` : passe l'application en maintenance ( possible de le faire aussi en mettant une variable "`maintain`" à 1 dans la table `Variable` ). Les superadmin déjà logués peuvent continuer à utiliser l'app.

`key` : clé secrète permettant d'encoder des tokens ou des mots de passe.

`camap_api` : URL de camap-ts, par exemple `https://api.camap.amap44.org` ou `http://localhost:3010`

`camap_bridge_api` : URL de camap-ts pour se connecter au bridge ( URL accessible depuis le container de camap-haxe, donc potentiellement différente de l'URL publique )

`mapbox_server_token` : token d'accès à Mapbox pour le geocoding

D'autres paramètres secondaires peuvent être stockés dans la table `Variable` ou dans l'objet [Theme](theme.md)

## TS

La configuration de camap-ts est stocké dans un fichier .env ( [ou via des variables d'environnement](https://docs.nestjs.com/techniques/configuration) )

`CAMAP_KEY`: idem `key` dans la config Haxe

`JWT_ACCESS_TOKEN_SECRET` : token secret pour l'authentification JWT

`JWT_ACCESS_TOKEN_EXPIRATION_TIME` : délai d'expiration en secondes, valeur conseillée : 900 (15 mn)

`JWT_REFRESH_TOKEN_SECRET` : token secret de rafraîchissement

`JWT_REFRESH_TOKEN_EXPIRATION_TIME` : valeur conseillée 2629746 (1 mois)

Connection à MySQL

```
DB_CONNECTION = mysql
DB_HOST = host
DB_USERNAME = user
DB_PASSWORD = pass
DB_DATABASE = db-camap
DB_PORT = 3306
DB_SYNCHRONIZE = false
DB_ENTITIES = ./dist/\*_/_.entity.js
DB_LOGGING = false
```

Paramètres SMTP

```
MAILER_TRANSPORT=smtp
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_AUTH_USER=user
SMTP_AUTH_PASS=pass
```

`MAPBOX_KEY` : token d'accès à Mapbox pour le geocoding

`API_HOSTNAME` et `API_PORT` : paramétrage du host et du port sur lequel l'app node va se lancer

`CAMAP_HOST` : URL de camap-haxe

URLs de camap-ts :

```
FRONT_URL=http://localhost:3010
FRONT_GRAPHQL_URL=http://localhost:3010/graphql
```

`HX_TRIGGER_CRONS` : mettre `true` pour que camap-ts déclenche les crons de camap-haxe ( pratique dans des environnements containerisés où la programmation d'une crontab n'est pas simple )

`THEME_ID` : ID du theme de l'instance, mettre `default` par défaut. [Voir le documentation sur les thème](./theme.md)
