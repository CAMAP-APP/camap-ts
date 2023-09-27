# Datasets

## Fonctionnalité

Afin de faciliter le développement de l'application, un système de génération de données de test a été créé.

Cela permet de facilement peupler une instance de dev ou de test avec des données correspondant à un scénario particulier.

## Code

Ce module est codé en TS et utilier [Faker](https://fakerjs.dev/) pour générer des données.

La fonction `datasetGenerators` prend en paramètre une application Nest et retourne les fonctions de génération de données.

```TS
// packages/api-core/src/dev/dataset-generator.ts

datasetGenerators(app: INestApplication) => Promise<DatasetGenerators>
```

Chaque fonction de génération de données correspond à une entité de l'app.

Par exemple, pour générer un nouveau groupe :

```TS
const { genGroup } = await datasetGenerators(app);
const group: GroupEntity = await genGroup({name: "AMAP St Martin"});
```

### îlot (islet)

Un îlot de données est un ensemble de données correspondant à un scénario de test.

Par exemple, le script `default.islet.ts` génère une AMAP avec 50 adhérents.

```TS

export default async (generators: DatasetGenerators, app: INestApplication) => {
  const group = await generators.genGroup({ name: 'AMAP de ' + faker.address.city() });
  let i = 50;
  while (i > 0) {
    const u = await generators.genUser({});
    await generators.genUserGroup({ userIdOrEntity: u, groupIdOrEntity: group });
    i--;
  }
  return { group };
};
```

## Cli

On peut utiliser la commande `npm run dataset <isletName> [options]`, depuis la racine de `camap-ts`, pour générer un îlot dans la bdd défini par le `.env`.

**/ ! \\ Cette commande doit être exécuté dans le container nest.** En dev utiliser : `docker-compose exec nest npm run dataset <isletName> -- [options]`

**Paramètre**

-   `<isletName>` : nom de l'îlot. Doit correspondre au fichier `packages/api-core/src/dev/islets/<isletName>.islet.ts`

**Options**

-   `-c, --clean` : permet de supprimer toutes les données de la bdd avant la génération de données.
-   `--noFail` : si l'îlot n'existe pas, permet de charger l'îlot par défaut (`packages/api-core/src/dev/islets/dafault.islet.ts`).

## Storybook

On peut utiliser la commande `npm run dataset-server`, depuis la racine de `camap-ts`, pour lancer le serveur d'îlot.

**/ ! \\ Cette commande doit être exécuté dans le container nest.** En dev utiliser : `docker-compose exec nest npm run dataset-server`

Le serveur écoute sur le port `6007`.

La route `/islets/:isletName?refresh=(Bool | undefined)` permet de générer un îlot de la même manière que la commande précédente.

L'îlot est ensuite mis en cache dans un fichier json qui sera resservit lors du prochain appel.

Pour supprimer le cache et donc générer un nouvel îlot, utiliser le paramètre `refresh`.

### Composant DatasetProvider & hook useDataset

Le composant `DatasetProvider` permet d'encapsuler une story en chargeant (cache ou génération) préalablement l'îlot demandé via la props `islet`.

La hook `useDataset` permet dans un composant enfant `DatasetProvider` d'accèder aux données.

```TS

// api: myIlset.islet.ts
export default (generators: DatasetGenerators) => {
  const group = await generators.genGroup({});

  const user = await generators.genUser({});

  return { group, user }
}


// front: story.ts
const MyComp = ({ groupId } : { groupId: number }) => {
  return <div>{`Le groupe ${groupId}`}</div>
}

const Template = () => {
  const { data } = useDataset();

  /** */
  return (
    <MyComp groupId={data.group} />
  );
};

export const Default = Template.bind({});
Default.decorators = [
  (Story: any) => (
    <DatasetProvider islet="myIlset">
      <Story />
    </DatasetProvider>
  ),
];

```

**Auth automatique**

Le composant `DatasetProvider` expose un paramètre optionnel `loginAs` qui permet l'auth automatique après la récupération de données.

`loginAs(data: any) => string`

```TS
export const Auth = Template.bind({});
Auth.decorators = [
  (Story: any) => (
    <DatasetProvider
      islet="myIlset"
      loginAs={(data) => { return data.user.email; }}
    >
      <Story />
    </DatasetProvider>
  ),
];
```
