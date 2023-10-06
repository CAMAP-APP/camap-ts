# Thème

## Fonctionnalité

Comme une installation Wordpress, CAMAP peut être personnalisé afin que chaque instance soit différente.

Le thème peut être modifié depuis l'interface d'administration de l'instance.

Il permet de customiser :

-   le nom du site
-   l'email expéditeur par défaut
-   l'email de support
-   les 4 blocs dans le footer du site
-   les blocs dans les footer d'email
-   le lien vers les CGU
-   l'apparence du site via le champs `id` (CSS et logos)

Le champs `id` correspond au dossier qui contient les fichiers images et CSS, par exemple le logo du site est chargé depuis l'URL `/theme/$themeId/logo`

Vous pouvez donc créer autant de thèmes que vous le souhaitez, et changer le thème de l'instance depuis l'interface d'administration en changant le champs `id`.

Les 2 thèmes disponibles actuellement sont `default` et `camap_old`

## Code

Pour obtenir l'objet Theme dans le code :

-   en Haxe : `App.getTheme()`
-   en TS : `const theme = await this.variableService.getTheme();`

La structure de l'objet Theme est [défini ici](https://github.com/CAMAP-APP/camap-hx/blob/master/common/Common.hx#L278) et il est stocké dans la table `Variable` en JSON.

Si le thème n'est pas stocké dans la BDD, [un objet par défaut est utilisé](https://github.com/CAMAP-APP/camap-hx/blob/master/src/App.hx#L63)

( La table `Variable` est multi-usage et permet de stocker des variables de configuration au niveau de l'instance. )

La création d'un nouveau thème CAMAP nécéssite la création et compilation d'un thème Bootstrap 3, [voir ici les instructions](https://github.com/CAMAP-APP/camap-hx/blob/master/www/theme/theme.md)
