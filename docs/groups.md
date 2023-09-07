# Groupes

## Fonctionnalité

Les groupes représentent une AMAP ( ou un GASAP ).

Les utilisateurs peuvent devenir membre d'un groupe, et eventuellement avoir certains droits dans ce groupe.

## BDD

### Group

Les groupes sont gérés par la table `Group`.

Le champs `regOption` correspond à un enum qui précise le mode d'entrée dans le groupe : Ouvert, par liste d'attente, fermé...

Le champs `disabled` correspond à un enum qui précise pourquoi ce groupe est bloqué. Si `disabled` est `null`, le groupe n'est pas bloqué et est utilisable.

### UserGroup

L'appartenance d'un utilisateur à un groupe est stocké dans le table `UserGroup` qui a une relation vers `User.id` et une autre vers `Group.id`. Il ne peut exister qu'un seul `UserGroup` par groupe-utilisateur ( clé primaire unique sur les 2 relations ).

Le champs `balance` représente le solde de l'utilisateur dans ce groupe ( somme du `Operation.amount` de toutes ses opérations ). Pour plus d'informations, consultez [la doc des paiements](./payments.md)

Le champs `rights` stocke les droits de ce membre dans ce groupe en JSON

## Code

L'entité `Group` est représentée par [Group.hx](https://github.com/CAMAP-APP/camap-hx/blob/master/src/db/Group.hx) en Haxe et par [group.entity.ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/groups/entities/group.entity.ts) en TS.

L'entité `UserGroup` est représentée par [UserGroup.hx](https://github.com/CAMAP-APP/camap-hx/blob/master/src/db/UserGroup.hx) en Haxe et par [user-group.entity.ts](https://github.com/CAMAP-APP/camap-ts/blob/master/packages/api-core/src/groups/entities/user-group.entity.ts) en TS.

## Droits dans un groupe

Les droits sont stockés dans `UserGroup.rights` en JSON et peuvent être de type :

```
GroupAdmin;					//administrateur du groupe
ContractAdmin(?cid:Int);	//peut gérer un contrat ( ou tous, si aucun "cid" n'est défini )
Membership;					//peut gérer la liste des membres.
Messages;	                //peut envoyer des messages
```

Les droits sont cumulables. Si quelqu'un veut pouvoir tout faire dans un groupe, il doit cumuler tous les droits.

```
//exemple de droits stockés en JSON dans UserGroup.rights
[
  {"right":"ContractAdmin","params":["8"]},
  {"right":"Messages","params":null},
  {"right":"Membership","params":null}
]

```
