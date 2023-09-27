## Templates

Les templates de camap-haxe sont gérés avec la librairie [templo](https://github.com/ncannasse/templo) ( fichiers \*.mtt )

Le développeur créé et modifie les templates dans `/lang/master/tpl`

Les templates sont compilés en 2 passes :

1. le framework copie ces templates dans chaque dossier de langue (ex : `/lang/fr/tpl`) en traduisant les chaines de textes via des fichiers de traduction gettext (`*.po` et `*.mo`)
2. le framework compile le template en \*.mtt.n dans le dossier `/lang/fr/tmp`

[Consultez la doc sur la traduction pour avoir plus d'informations](i18n.md)

En **environnement de dev**, mettez DEBUG=1 dans config.xml cela aura pour effet d'exécuter les 2 passes automatiquement et de voir directement le résultat des modifications de templates en local

En **environnement de production**, mettez DEBUG=0 pour gagner en performance.
Cela veut dire qu'il faut exécuter les 2 passes avant le déploiement.
Compiler l'app avec l'option i18n_generation pour l'étape 1 :

```
haxe build.hxml -D i18n_generation
```

puis compilez les templates en `*.mtt.n` dans chaque dossier de `lang` pour l'étape 2

```
neko ../../../backend/temploc2.n -macros macros.mtt -output ../tmp/ *.mtt */*.mtt */*/*.mtt
```
