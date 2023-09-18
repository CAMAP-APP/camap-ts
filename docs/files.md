# Files

## Fonctionnalité

Le framework web Sugoï utilisé pour `camap-haxe` propose une gestion simple des fichiers uploadés par les utilisateurs.

Tous les fichiers binaires ( images, PDF ...) sont stockés dans la table `File` avec un champs de type `mediumblob`.

Tout appel à une URL de type `/file/$fileHash` va charger le fichier si il existe dans le dossier file, si il n'existe pas, l'application va chercher le fichier stocké en BDD et l'écrire sur le disque dans `/file/`. ( cf .htaccess dans /file/)

Ce mécanisme est très pratique puisqu'il permet de sauvegarder une installation de CAMAP uniquement avec un _dump SQL_ puisque la BDD contient également tous les fichiers uploadés par les utilisateurs.

## Code

Les Files sont géré directement [par le framework Sugoï](https://github.com/AliloSCOP/sugoi/blob/master/src/sugoi/db/File.hx)

Dans CAMAP, un cron nettoie les fichiers inutilisés : tache `Clean unused db.File entities` dans `Cron.hx`

La plupart des mécanismes ont été portés en TS dans le module `files`
