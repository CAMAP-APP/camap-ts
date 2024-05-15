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

#### backend (templates):
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

-   Installer les dépendances : `npm i`
-   Tout compiler : `npm run build`
-   Relancez éventuellement le container nest-loc-camap

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

## Utiliser le docker-compose.yml pour le dev

Cela permettra, grâce aux volumes, de lancer les conteneurs docker avec les fichiers sources locaux de la machine hote.

exécuter ```docker-compose up -d --build```


