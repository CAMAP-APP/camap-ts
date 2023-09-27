# Permanences

## Fonctionnalité

La gestion des permanences permet de définir un certain nombre de rôles de bénévoles à remplir lors des distributions. Les adhérents sont invités à s'inscrire à des permanences afin de participer à la vie de l'AMAP.

## BDD

Les **rôles** de bénévoles sont stockés dans la table `VolunteerRole`, qui a une relation vers `Group` et une relation optionnelle vers `Catalog` si le rôle concerne un contrat en particulier.

Les **rôles à remplir pour une distribution donnée** sont stockés dans `MultiDistrib.volunteerRolesIds`

Les **inscriptions d'un User à un rôle pour une distribution donnée** sont stockées dans la table `Volunteer` avec des relations vers `User` , `MultiDistrib` et `VolunteerRole`.

## Code

### Calendrier des permanences

La calendrier des permanences permet aux adhérents de s'inscrire en tant que bénévole lors d'une des prochaines distributions.

Il est codé avec un front en TS (_React JS_) nommé `volunteersCalendar`. Le backend est en haxe (_API REST_, controller dans `controller/api/Distribution`)

### Emails liées aux permanences

L'alerte email lorsqu'il n'y a pas de bénévoles inscrits pour une distribution imminente, et l'email d'instructions aux bénévoles sont envoyés via le cron hourly `Cron.doHour()` en Haxe, tâches `"Volunteers instruction mail"` et `"Volunteers alerts"`.
