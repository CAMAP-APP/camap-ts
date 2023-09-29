# Utils

Documentation de diverses méthodes du dossier [common](../src/common).

# checkDeleted

Pour vérifier le résultat d'un delete TypeORM.
Retourne `true` si le record a bien été supprimé, `faux` sinon.

## Usage

Le premier paramètre est le résultat du delete de type [DeleteResult](../node_modules/typeorm/query-builder/result/DeleteResult.d.ts).

```TS
// memberships.service

[...]

    const deleteResult = await this.membershipRepo.delete({
      groupId: membership.groupId,
      userId: membership.userId,
      year: membership.year,
      operationId: membership.operationId,
    });

    return checkDeleted(deleteResult)
        ? {userId: membership.userId, groupId: membership.groupId, year: membership.year}
        : null;

[...]

```

### Paramètres optionnels

- Le second paramètre _expected_ est le nombre de records qui doivent être supprimés (defaut à 1)
- Si le troisième paramètre _throwError_ est `true`, la fonction va throw une erreur au lieu de renvoyer false.

```TS
const deleteResult = await this.entityRepo.delete(...);

return checkDeleted(deleteResult, 4, true) ? id : null;
```
