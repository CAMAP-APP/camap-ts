# Troubleshooting

Consultez cette section en cas d'erreur


## Sur le navigateur
`Error : load.c(181) : Module not found : /srv/www/../lang/fr/tmp/error.mtt.n`
- Vérifier que les fichiers dans `lang/fr` ont bien été générés
- Sinon :
	- Relancer build
	- Checker permission
	Si cela ne fonctionne pas : 
	- Lisez ['.templates.md'](./templates.md) pour bien comprendre le fonctionnement des templates
	- `cd backend && haxe build.hxml -D i18n_generation && cd tpl && neko ../../../backend/temploc2.n -macros macros.mtt -output ../tmp/ *.mtt */*.mtt */*/*.mtt`


`"Unsupported charset : #255"`
- Attention à ne pas créer la DB vous même, laissez le serveur camap-hx le faire pour imposer le bon charset

`"Error : Invalid field access : id"`
- **explication**: L'application (haxe) essaye d'accéder à la base de données mais celle-ci n'est pas disponible ou n'est pas initialisée
- à vérifier:
	- initialisation la base de données (`camap-ts> npm run schema:sync` puis visiter [https://camap.localdomain/install](https://camap.localdomain/install))
	- la base de données accepte les connexionl'accès via mysql_native_password
	- la base de données est accessible dans l'environnement haxe
	- Recréez un container neko-loc-camap, charger la page `https://camap.localdomain/` puis vérifiez les logs si besoin
- ⚠ N'oubliez pas, il faut ouvrir la page dans la navigateur pour lancer la génération !

La route `https://camap.localdomain/user/login` fonctionne, mais n'affiche pas le formulaire + erreurs en console (`Uncaught TypeError: can't access property "createNeoModule", neo is undefined`)

## Base de données - loc-mysql
- `[Warning] World-writable config file '/etc/mysql/conf.d/my.cnf' is ignored.`
	- Changer les permissions vers 0444: `chmod 0444 my.cnf`
	- Et monter le dossier :
		```yaml
		volumes:
				# Set mysql extra config:
				- my.cnf:/etc/mysql/conf.d/my.cnf
		```

Si la config BD est bien prise en compte, le warning suivant doit apparaitre dans les logs de la BD : "Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'"

- `Public Key Retrieval is not allowed` (depuis un client BD comme DBeaver)
	- La config my.cnf n'a pas l'air d'être prise en compte (et donc le mode de connexion particulier)

## camap-ts - nest-loc-camap
- `[Nest] 31  - 04/30/2024, 9:53:00 AM   ERROR [Scheduler] QueryFailedError: Table 'db-camap.BufferedJsonMail' doesn't exist`
	- Soit : Les tables de la BD n'ont pas été créées. Vérifier les logs pour voir si une autre erreur apparait
	- Soit : Nest n'arrive pas à se connecter à) la BD

- `Failed to connect to mysql server : Failed to connect on host 'loc-mysql'`
	- Relancer, le docker compose a peu être été trop vite..
	- Erreur rare

 ### camap-hx - neko-loc-camap
- ` Failed to connect to mysql server : Client does not support authentication protocol requested by server; consider upgrading MySQL client`
	- Pour brancher Neko sur MySQL8, il faut utiliser l'ancienne authentification "mysql_native_password". Pour cela, une ligne a été ajoutée dans `camap-ts/mysql/my.cnf`. Cependant, il faut vérifier que ce fichier est bien pris en compte par la BD. Vérifier les logs de loc-mysql si le warning "World-writable config file" est présent

- `Segmentation fault`
	- Pas sur, mais tentez d'augmenter la RAM affectée à Docker (j'ai dû monter à 12GB personnellement)
	- N'hésitez pas à tenter de lancer plusieurs fois le container jusqu'à temps que cela fonctionne

- `Error : Temploc compilation of error.mtt failed : Called from templo/Main.nml line 183`
	- Le dossier lang/master/tmp ne doit pas exister. Essayer de le créer à la main

- `TypeError: can't access property "createNeoModule", neo is undefined`
	- Essayer `npm run build:front` dans camap-ts
		- Si il y a une erreur de `camap-common not found`, rebuilder le tout => Dans le dossier packages : `npm run build`

- `unable to load resources from camap-ts`
	- **explication**: SSL n'est pas configuré en local et l'application ne parvient pas à accéder à camap-ts par manque de permission
	- **solution**: ouvrir le navigateur sur [https://api.camap.localdomain/](https://api.camap.localdomain/) et ajouter une exception de sécurité.