# Installation pour un environnement de développement

Installer un environnement de développement pour CAMAP n'est pas complètement trivial,
nous détaillerons ici les étapes permettant d'obtenir :
- Un environnement avec coloration syntaxique et auto-complexion pour le projet haxe,
- Un environnement avec coloration syntaxique et auto-complexion pour le projet typescript.

Limites :
- La possibilité de déboguer le projet est très limitée avec haxe sur neko en mod apache,
  breakpoints et inspection en pas par pas ne sera pas possible.
- La possibilité de déboguer le projet typescript est possible mais nécessite des étapes d'installations supplémentaires qui ne seront pas détaillées ici. En effet, la présente documentation s'appuie sur Minikube (Kubernetes local) pour faire tourner l'ensemble de l'environnement. Avoir un environnement avec débogage nécessiterait de faire tourner le projet camap-ts sur la machine locale, et de configurer en local également un reverse proxy.

L'installation consistera à
1. installer l'environnement projet de base sous Minikube (via [**minikube-camap**](https://github.com/CAMAP-APP/minikube-camap)),
2. installer les outils et dépendances nécessaires pour le développement (IDE, Haxe, Node),
3. builder localement les images camap-ts / camap-hx et les charger dans Minikube pour tester ses modifications.

> ⚠️ L'ancien environnement [camap-docker](https://github.com/CAMAP-APP/camap-docker) (docker-compose) n'est plus maintenu et n'est probablement plus fonctionnel.

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
  - installer l'environnement vscode (auto-complétion, compilation locale pour vérifier le code).
  - Pour tester dans l'environnement Minikube, rebuilder l'image camap-hx et la recharger (voir [Tester ses modifications](#tester-ses-modifications-dans-minikube)).

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
- compilation: camap-ts> `npm run build:api` (compile aussi les templates de mails)
- output: camap-ts/packages/api-core/dist/*
- exécution:
  - camap-ts> `npm start`
  - cron: voir [crons.md](crons.md)

#### camap-ts/packages/api-core/mails

- role: Compiler les templates de mails pour l'envoi de mails de la partie typescript de l'app.
- sources: camap-ts/packages/api-core/mails
- compilation: camap-ts/packages/api-core> `npm run build:mail` (inclus dans `npm run build:api`)
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
		- Attention : le fichier `src/palette.ts` est copié depuis `src/theme/$THEME_ID/palette.ts` par la config webpack de production (`webpack.config.js`, plugin `FileManagerPlugin`), mais pas par `webpack.dev.config.js`.

- utilisation: 
  - Le template haxe [base.mtt](..%2F..%2Fcamap-hx%2Flang%2Fmaster%2Ftpl%2Fbase.mtt) importe les scripts via [BridgeService.hx](..%2F..%2Fcamap-hx%2Fsrc%2Fservice%2FBridgeService.hx)
  - voir [neo-modules.md](neo-modules.md)

## Installer l'environnement projet

L'environnement local est décrit dans le dépôt template [**minikube-camap**](https://github.com/CAMAP-APP/minikube-camap) (Minikube + Argo CD + charts Helm camap et mailpit). Suivre son README, qui fait foi. En résumé :

1. Créer sa propre copie du dépôt (**Use this template** sur GitHub) et remplacer l'URL du dépôt dans `root-app.yaml`, `apps/camap.yaml` et `apps/mailpit.yaml`.
2. Installer Docker Desktop, kubectl et Minikube, puis :
   ```powershell
   minikube start --driver=docker
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```
3. Installer Argo CD dans le namespace `argocd` et y déclarer son dépôt. Si la copie du dépôt est **privée**, Argo CD demande un login GitHub et un token (fine-grained token limité au dépôt, permission *Contents : Read-only*).
4. Créer les namespaces `camap` et `mailpit`, ainsi que les secrets `camap-mysql` et `camap-runtime` dans `camap` (voir le README pour les clés attendues).
5. Ajouter dans le fichier hosts : `127.0.0.1   camap.local api.camap.local mailpit.local`
6. Déployer l'App of Apps : `kubectl apply -f root-app.yaml -n argocd`
7. Lancer `minikube tunnel` (terminal à laisser ouvert, les droits administrateur ne sont pas nécessaires), puis ouvrir [http://camap.local/install](http://camap.local/install) : le formulaire (nom du groupe, prénom, nom) crée le compte admin (`admin@camap.tld` / `admin`) et un groupe de démonstration avec un contrat et deux produits d'exemple.

> ⚠️ **Contexte kubectl** : `minikube start` bascule le contexte kubectl courant sur `minikube`, et les commandes du README s'appliquent au contexte courant. Si vous travaillez aussi sur d'autres clusters (production, préproduction…), vérifiez-le avec `kubectl config current-context` avant de lancer des commandes, ou ajoutez `--context minikube`. Exemples de cette documentation : remplacer `kubectl ...` par `kubectl --context minikube ...`.

Les emails envoyés sont visibles dans Mailpit : [http://mailpit.local](http://mailpit.local)

Ressources déployées dans le namespace `camap` :

| Ressource | Rôle |
|---|---|
| `camap-api` (deployment) | camap-ts (image `ghcr.io/camap-app/camap-ts`), port 3010, `api.camap.local` |
| `camap-web` (deployment) | camap-hx (image `ghcr.io/camap-app/camap-hx`), Apache + Neko, `camap.local`. Proxifie `/neostatic`, `/graphql` et `/locales` vers `camap-api` |
| `camap-mysql` (statefulset) | MySQL 8.0 |

La configuration (`camapts.env`, `config.xml`) est générée au démarrage des pods par un `initContainer` à partir des templates `deployments/camap/files/*.tpl`, des valeurs de `deployments/camap/values.yaml` (`camapConfig`) et des secrets.

Côté `camap-web`, `camapts.env` sert aussi à générer `/env.js` (`window.__APP_CONFIG__`) lu par le front : `CAMAP_HOST` (`camapConfig.camapHost`) et `CAMAP_BRIDGE_API` (`camapConfig.camapBridgeApi`) doivent être des URLs **accessibles depuis le navigateur**. Pour vérifier : ouvrir [http://camap.local/env.js](http://camap.local/env.js).

### Vérifier l'installation

- [http://camap.local](http://camap.local) : connexion avec `admin@camap.tld` / `admin`
- [http://camap.local/env.js](http://camap.local/env.js) : contient `CAMAP_HOST`, `CAMAP_BRIDGE_API`, `FRONT_GRAPHQL_URL`
- Envoyer un message depuis l'onglet Messagerie : il doit apparaître dans [Mailpit](http://mailpit.local) en moins d'une minute (le cron d'envoi tourne toutes les minutes)
- `kubectl logs -n camap deploy/camap-web | grep cron/minute` : camap-ts déclenche le cron Haxe toutes les minutes (`HX_TRIGGER_CRONS=true`)

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

## Tester ses modifications dans Minikube

Il n'y a pas de montage des sources locales dans les pods : pour tester une modification, on builde l'image localement et on la charge dans Minikube.

### 1. Builder l'image

Depuis le répertoire du projet concerné, avec son propre Dockerfile :

```powershell
# camap-ts
docker build -t camap-ts:local -f camap-ts.Dockerfile .

# camap-hx
docker build -t camap-hx:local -f camap-hx.Dockerfile .
```

### 2. Charger l'image dans Minikube

```powershell
minikube image load camap-ts:local
minikube image load camap-hx:local
```

### 3. Pointer le chart vers l'image locale

Dans `deployments/camap/values.yaml` de sa copie de minikube-camap :

```yaml
image:
  api:
    repository: camap-ts
    tag: "local"
    pullPolicy: Never   # indispensable, sinon Kubernetes tente de puller depuis ghcr.io
  web:
    repository: camap-hx
    tag: "local"
    pullPolicy: Never
```

Puis forcer un sync dans Argo CD, ou redémarrer le déploiement :

```powershell
kubectl rollout restart deployment camap-api -n camap
kubectl rollout restart deployment camap-web -n camap
```

> Après un rebuild avec le même tag `local`, refaire `minikube image load` puis `kubectl rollout restart`.

### Commandes utiles

```powershell
kubectl get pods -n camap                                  # état des pods
kubectl logs -n camap deploy/camap-api -f                  # logs camap-ts
kubectl logs -n camap deploy/camap-web -f                  # logs camap-hx (Apache/Neko)
kubectl exec -it -n camap deploy/camap-api -- /bin/bash    # shell dans le pod camap-ts (répertoire /srv)
kubectl exec -it -n camap deploy/camap-web -- /bin/bash    # shell dans le pod camap-hx (répertoire /srv)
```

En cas d'erreur, se référer au [troubleshooting](./troubleshooting.md).