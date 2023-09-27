# Crons

## En Haxe

Les taĉhes de cron sont rassemblées dans le controller `Cron.hx` et sont rassemblées en 3 groupes :

-   les taches quotidiennes, habituellement executées la nuit (_daily cron_)
-   les tâches qui s'exécutent toutes les heures (_hourly cron_)
-   les tâches qui s'éxécutent toutes les minutes

Comme pour les app en PHP, il est nécéssaire de programmer la `crontab` sur le serveur :

```
* * * * * cd /var/vhosts/camap/www/ && /usr/local/bin/neko index.n cron/minute >> /dev/null 2>&1
0 * * * * cd /var/vhosts/camap/www/ && /usr/local/bin/neko index.n cron/hour >> /dev/null 2>&1
15 0 * * * cd /var/vhosts/camap/www/ && /usr/local/bin/neko index.n cron/daily >> /dev/null 2>&1
```

Chaque tâche est wrappée dans un `TransactionWrappedTask()` afin d'éxécuter chaque tâche dans une [transaction](https://dev.mysql.com/doc/refman/8.0/en/glossary.html#glos_transaction) séparée, ainsi, si une tâche échoue, ça n'affectera pas le déroulement des autres tâches.

## En Ts

En Node JS, les crons sont gérés directement par Node.

Le [framework Nest propose des décorateurs](https://docs.nestjs.com/techniques/task-scheduling) pour transformer des méthodes de services en crons :

```TS
  @Cron(CronExpression.EVERY_MINUTE)
  async sendEmailsFromBuffer() {
    ...
  }
```
