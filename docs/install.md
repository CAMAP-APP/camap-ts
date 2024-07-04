# Installation pour un environnement de développement

Installer un environnement de développement pour CAMAP n'est pas complètement trivial,
nous détaillerons ici les étapes permettant d'obtenir :
- Un environnement avec coloration syntaxique et auto-complexion pour le projet haxe,
- Un environnement avec coloration syntaxique et auto-complexion pour le projet typescript.

Limites :
- La possibilité de déboguer le projet est très limitée avec haxe sur neko en mod apache,
  breakpoints et inspection en pas par pas ne sera pas possible.
- La possibilité de déboguer le projet typescript est possible mais nécessite des étapes d'installations supplémentaires qui ne seront pas détaillées ici. En effet, la présente documentation s'appuira sur docker-compose pour faire tourner l'ensemble de l'environnement. Avoir un environnement avec debogage nécessiterait de faire tourner le projet camap-ts sur la machine locale, et de configurer en local également un reverse proxy.

L'installation consistera a
1. installer l'environnement projet de base (via [**camap-docker**](https://github.com/CAMAP-APP/camap-docker)),
2. installer les outils et dépendances nécessaire pour le développement.
3. personnaliser le docker-file pour utiliser les fichiers sources locaux de la machine hote dans les conteneurs docker,

En cas d'erreur, un troubleshooting est à disposition [ici](./troubleshooting.md)

## Architecture des projets et interactions

Pour développer une évolution dans l'application CAMAP, il est nécessaire de comprendre comment les projets s'articulent.

### camap-hx (Le socle applicatif initial):

#### backend (templates et api):
- role: 
  - rendu de templates "templo" via apache2 mod neko.
  - service d'API sur `/api/<controller>/<action>` où <controller> est défini dans `camap-hx\src\controller\api\<Controller>.hx` et <action> en tant que `doAction` dans le controlleur.
- sources: camap-hx/common, camap-hx/src, camap-hx/lang/master/tpl, camap-hx/backend
- output: camap-hx/www/index.n (fichier neko)
- compilation: `haxe.exe backend/build.hxml --cwd backend`
- exécution: via le mod apache2 "neko" et le `camap-hx/www/.htaccess` qui pointe vers `camap-hx/www/index.n`
- documentation spécifique: [camap-hx/README.md](../../camap-hx/README.md), [camap-ts/docs/i18n.md](./i18n.md), [camap-ts/docs/templates.md](./templates.md)
- développement: 
  - installer l'environnement vscode + docker-compose de développement.
  - Les modifications des templates (.mtt) sont prises en compte au rechargement de la page.
  - Les modifications haxe nécessitent une recompilation (build backend/build.hxml depuis vscode)

#### backend (cron):
- voir [crons.md](crons.md)

#### backend (css, html, images, fonts et autres fichiers statics)
- role: fournir les fichiers css pour les thèmes et les styles de pages
- sources: camap-hx/www/*, camap-hx/www/theme/default/css/bootswatch.scss, camap-hx/www/theme/default/css/variables.less
- output: camap-hx/www/, camap-hx/www/theme/default/css/style.min.css
- compilation: `camap-hx/www/theme/default/css_compile.sh`
- exécution: 
  - Le dossier camap-hx/www est mis à disposition d'apache pour servir les fichiers statics. Voir [apache.conf](../../camap-hx/apache.conf)
  - Utilisé par les templates (ie. [`camap-hx/lang/master/tpl/base.mtt`](../../camap-hx/lang/master/tpl/base.mtt))
- documentation spécifique: [camap-hx/www/theme/theme.md](../../camap-hx/www/theme/theme.md)
- développement: recompiler via `camap-hx/www/theme/default/css_compile.sh` en cas de modification de bootswatch.scss ou variables.less

#### frontend:
- role: rendu et interactions dynamiques en JavaScript dans les pages web.
- sources: camap-hx/common, camap-hx/js, camap-hx/frontend/libs/libs.js
- output: 
  - camap-hx/www/js/app.js
    - compilation:  `haxe.exe frontend/build.hxml --cwd frontend` 
  - camap-hx/www/js/libs.prod.js
    - fonctionnement: voir https://lib.haxe.org/p/modular/0.6.0/
    - compilation (depuis camap-hx/frontend) : `npm run libs:prod`
- exécution: 
  - Le dossier camap-hx/www est mis à disposition d'apache pour servir les fichiers statics. Voir [apache.conf](../../camap-hx/apache.conf)
  - Utilisé par les templates (ie. [`camap-hx/lang/master/tpl/base.mtt`](../../camap-hx/lang/master/tpl/base.mtt))

### camap-ts

Camap-ts rassemble un ensemble de sous projet. Le projet parent contient un package.json et quelques outils pour les pilotes globalement.

- role: build et démarrer les sous-projets
- exécution: voir [package.json](..%2Fpackage.json)
  - installer toutes les dépendances des packages: camap-ts> `npm install`
  - build tous les packages: camap-ts> `npm run build`
  - Démarrer le serveur nest et le cron: camap-ts> `npm start`

#### camap-ts/packages/camap-common

- role: Bibliothèque de code partagé pour les autres application.
- sources: camap-ts/packages/camap-common/src
- compilation (via rollup):  camap-ts> `npm run build:common`
- output:
  - camap-ts/packages/camap-common/dist/index.js
    - point d'entrée au format commonJS de la lib

#### camap-ts/packages/api-core

- role: Serveur d'API NestJS, fournit un service d'API complémentaire à camap-hx/backend.
- sources: camap-ts/packages/api-core/src, camap-common
- compilation: camap-ts> `npm run build:front`
- output: camap-ts/packages/front-core/dist/*
- exécution:
  - camap-ts> `npm start`
  - cron: voir [crons.md](crons.md)

#### camap-ts/packages/api-core/mails

- role: Compiler les templates de mails pour l'envoi de mails de la partie typescript de l'app.
- sources: camap-ts/packages/api-core/mails
- compilation: camap-ts> `npm run build:mail`
- output: camap-ts/packages/api-core/mails/dist
- exécution: via le service nest [emails.md](emails.md)

#### camap-ts/packages/front-core

- role: Compile les neomodules pour les fournir au frontend à la demande.
- sources: camap-ts/packages/front-core/src, camap-common
- output: 
  - camap-ts/public/neostatic/*.bundle.js
  - camap-ts/public/neostatic/manifest.json
- compilation: camap-ts> `npm run build:front`
	- Astuce : il est possible d'utiliser `npm run watch` dans `packages/front-core` pour recompiler automatiquement les fichiers front modifiés. 
		- Vous pouvez compléter avec le module filewatcher de firefox pour recharger automatiquement la page à la modification d'un fichier dans `/neostatic/` - NdR: Il est probablement possible de mettre en place un serveur de dév ou du hot reload. Cf les 3 solutions possibles de webpack ici : https://webpack.js.org/guides/development/#choosing-a-development-tool. 
		- Attention : A des fin d'optimisation en dév, le fichier de config webpack en dev ne génère pas le fichier palette.ts (cf `webpack.dev.config.js`). Décommenter l.74 pour le faire revenir 

- utilisation: 
  - Le template haxe [base.mtt](..%2F..%2Fcamap-hx%2Flang%2Fmaster%2Ftpl%2Fbase.mtt) importe les scripts via [BridgeService.hx](..%2F..%2Fcamap-hx%2Fsrc%2Fservice%2FBridgeService.hx)
  - voir [neo-modules.md](neo-modules.md)

## Installer l'environnement projet

Tout d'abord, suivez les étapes d'installation de [**camap-docker**](https://github.com/CAMAP-APP/camap-docker).

Utiliser dans un premier temps le docker-compose.yml de base.

Une fois les étapes terminées, assurez vous de jouer une première fois la commande `docker compose up -d --build` et de vérifier que l'environnement fonctionne en mode production.

## Installer les outils et dépendances

- Installer [NodeJS en version 20.X](https://nodejs.org/)
- Installer lix (équivalent de npm+nvm pour Haxe) : `npm i -g lix`
- Installer [VSCode](https://code.visualstudio.com/)
  - Installer l'extension "Haxe extension pack" depuis l'onglet extensions de VSCode
  - Installer l'extension "Templo" depuis l'onglet extensions de VSCode
  - Installer l'extension "lix" depuis l'onglet extensions de VSCode

## Projet haxe

- Ouvrez [backend.code-workspace](../../camap-hx/backend/backend.code-workspace) avec VSCode pour avoir l'environnement backend
  - Exécutez les commandes dans le dossier backend:
    - `lix scope create`
    - `lix install haxe 4.0.5`
    - `lix use haxe 4.0.5`
    - `lix download`
  - Exécutez les actions:
    - "Haxe: Restart Language Server" pour vérifier que votre installation a bien détecté l'environnement haxe.
    - "Build"
- Ouvrez [frontend.code-workspace](../../camap-hx/frontend/frontend.code-workspace) avec VSCode pour avoir l'environnement frontend
  - Exécutez les commandes dans le dossier frontend:
    - `lix scope create`
    - `lix use haxe 4.0.5`
    - `lix download`
    - `npm install`
	- Exécutez les actions:
		- "Haxe: Restart Language Server" pour vérifier que votre installation a bien détecté l'environnement haxe.
		- "Build"

## Utiliser le docker-compose.dev.yml pour le dev

Cela permettra, grâce aux volumes, de lancer les conteneurs docker avec les fichiers compilés locaux de la machine hote.

exécuter ```docker-compose up -d```