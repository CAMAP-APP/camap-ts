# Troubleshooting

Consultez cette section en cas d'erreur. Les exemples supposent l'environnement local Minikube décrit dans l'[installation](./install.md) (namespace `camap`, déploiements `camap-api` / `camap-web`, statefulset `camap-mysql`).

Pour diagnostiquer, commencer par :

```powershell
kubectl get pods -n camap
kubectl describe pod -n camap <pod>
kubectl logs -n camap deploy/camap-api
kubectl logs -n camap deploy/camap-web
kubectl logs -n camap statefulset/camap-mysql
```

## Environnement Minikube

`camap.local` / `api.camap.local` ne répondent pas
- Vérifier que `minikube tunnel` tourne (terminal à laisser ouvert)
- Vérifier les entrées du fichier hosts : `127.0.0.1   camap.local api.camap.local mailpit.local`
- Vérifier que l'addon ingress est activé : `minikube addons enable ingress`

Pod en `ErrImageNeverPull` ou `ImagePullBackOff`
- Avec `pullPolicy: Never`, l'image doit avoir été chargée dans Minikube : `minikube image load camap-ts:local` (ou `camap-hx:local`)
- Vérifier le nom et le tag dans `deployments/camap/values.yaml`

Une modification de l'image locale n'est pas prise en compte
- Après un rebuild avec le même tag, refaire `minikube image load ...` puis `kubectl rollout restart deployment camap-api -n camap` (ou `camap-web`)

Erreurs `spec.selector immutable` / `StatefulSet forbidden update` après une modification du chart
- Forcer la synchronisation : `argocd app sync camap --force`

Pod bloqué en `Init` / `CreateContainerConfigError`
- Les secrets `camap-mysql` et `camap-runtime` doivent exister dans le namespace `camap` (voir le README de minikube-camap)

## Sur le navigateur

`Error : load.c(181) : Module not found : /srv/www/../lang/fr/tmp/error.mtt.n`
- Les templates compilés de `lang/fr` n'ont pas été générés dans l'image camap-hx
- Vérifier les logs du build Docker de camap-hx (étapes `haxe build.hxml -D i18n_generation` puis `temploc2`)
- Lisez [templates.md](./templates.md) pour bien comprendre le fonctionnement des templates
- Pour tester à la main dans le pod (`kubectl exec -it -n camap deploy/camap-web -- /bin/bash`) : `cd /srv/backend && haxe build.hxml -D i18n_generation && cd /srv/lang/fr/tpl && neko ../../../backend/temploc2.n -macros macros.mtt -output ../tmp/ *.mtt */*.mtt */*/*.mtt`

`"Unsupported charset : #255"`
- Attention à ne pas créer la DB vous même, laissez le serveur camap-hx le faire pour imposer le bon charset

`"Error : Invalid field access : id"`
- **explication**: L'application (haxe) essaye d'accéder à la base de données mais celle-ci n'est pas disponible ou n'est pas initialisée
- à vérifier:
	- l'initialisation de la base de données : visiter [http://camap.local/install](http://camap.local/install)
	- la base de données accepte l'authentification via `mysql_native_password`
	- le pod `camap-mysql` est démarré et accessible depuis `camap-web`
	- redémarrer `camap-web` (`kubectl rollout restart deployment camap-web -n camap`), charger la page [http://camap.local/](http://camap.local/) puis vérifier les logs si besoin
- ⚠ N'oubliez pas, il faut ouvrir la page dans le navigateur pour lancer la génération !

`"Failed to fetch"` avec un message console de type `Mixed Content: ... requested an insecure resource ...` (ou des appels vers un nom d'hôte interne au cluster)
- **explication**: La variable `CAMAP_HOST` est une URL qui n'est pas accessible par le navigateur (erreur de domaine ou de protocole).
- Vérifier `camapConfig.camapHost` (et `camapBridgeApi`) dans `deployments/camap/values.yaml` : ces URLs sont utilisées pour générer des URLs à destination du navigateur.
- Ces valeurs ne sont pas figées au build du front : elles sont injectées au démarrage du pod camap-hx dans `www/env.js` (`window.__APP_CONFIG__`, cf `camap-hx/entrypoint.sh`). Il suffit de redémarrer `camap-web` après modification (inutile de rebuilder front-core).

`TypeError: can't access property "createNeoModule", neo is undefined` ou `neo is not defined` (par exemple la page `/user/login` s'affiche sans formulaire)
- Les bundles du front (`/neostatic/...`) ne sont pas chargés : vérifier dans la console réseau du navigateur si les appels HTTP aux bundles sont OK
- `camap-web` proxifie `/neostatic` vers `camap-api` : vérifier que le pod `camap-api` tourne
- Si l'image camap-ts a été buildée localement, vérifier que le build front s'est bien passé (`npm run build:front` ; en cas d'erreur `camap-common not found`, lancer `npm run build` à la racine de camap-ts)

## Base de données - camap-mysql

- `Public Key Retrieval is not allowed` (depuis un client BD comme DBeaver)
	- La config `my.cnf` (`default-authentication-plugin=mysql_native_password`) n'a pas l'air d'être prise en compte. Elle est définie dans `mysql.config.myCnf` du `values.yaml`.

Si la config BD est bien prise en compte, le warning suivant doit apparaître dans les logs de la BD : "Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'"

## camap-ts - camap-api

- `ERROR [Scheduler] QueryFailedError: Table 'camap.BufferedJsonMail' doesn't exist`
	- Soit : Les tables de la BD n'ont pas été créées (passer par [http://camap.local/install](http://camap.local/install), puis jouer les [migrations](./schema.md)). Vérifier les logs pour voir si une autre erreur apparaît
	- Soit : camap-ts n'arrive pas à se connecter à la BD

- `Failed to connect to mysql server`
	- Le pod MySQL n'était peut-être pas encore prêt : attendre puis redémarrer le pod concerné

## camap-hx - camap-web

- `Failed to connect to mysql server : Client does not support authentication protocol requested by server; consider upgrading MySQL client`
	- Pour brancher Neko sur MySQL 8, il faut utiliser l'ancienne authentification `mysql_native_password` (ligne `default-authentication-plugin` dans `mysql.config.myCnf` du `values.yaml`). Vérifier que cette config est bien prise en compte par la BD.

- `Segmentation fault`
	- Pas sûr, mais tentez d'augmenter la RAM affectée à Docker Desktop / Minikube, ainsi que les `resources.web.limits` du chart
	- N'hésitez pas à redémarrer le pod plusieurs fois

- `Error : Temploc compilation of error.mtt failed : Called from templo/Main.nml line 183`
	- Le dossier `lang/master/tmp` doit exister. Essayer de le créer à la main
