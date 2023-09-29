# Dataset

## Génération de données

La fonction `datasetGenerators` prend en paramètre une application Nest et retourne les fonctions de génération de données.

```TS
// packages/api-core/src/dev/dataset-generator.ts

datasetGenerators(app: INestApplication) => Promise<DatasetGenerators>
```

Chaque fonction de génération de données correspond à une entité du modèle.

Par exemple, pour générer un nouveau groupe :

```TS
const { genGroup } = await datasetGenerators(app);
const group: GroupEntity = await genGroup({
  name: "Nouveau Groupe"
});
```

### Relation entre les entités

```TS
@Entity('Group')
class GroupEntity {
  /**
   * ManyToOne
   */
  @Column('int', { nullable: true })
  userId: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;
}

const { genGroup, genUser } = await datasetGenerators(app);

const user: UserEntity = await genUser({
  id: 1
});
let group: GroupEntity;

group = await genGroup({});
console.log(group.userId); // null
console.log(await group.user); // null

group = await genGroup({
  userIdOrEntity: user // <- UserEntity
});
console.log(group.userId); // 1
console.log(await group.user); // UserEntity { id: 1, ...}
console.log((await group.user).id); // 1

group = await genGroup({
  userIdOrEntity: user.id // <- number
});
console.log(group.userId); // 1
console.log(await group.user); // UserEntity { id: 1, ...}
console.log((await group.user).id); // 1

```

## îlot (islet)

Un îlot de données est un ensemble de données liés entre elles.

Par exemple, pour tester les fonctionnalités liées au tunnel d'achat, on peut définir une fonction qui va générer un groupe contenant une distribution proposant à la vente sur place ou par virement de deux produits d'un catalogue d'un producteur ...

```TS

const genTransactionIslet = async (generators: DatasetGenerators) => {
  const group = await generators.genGroup({
    allowedPaymentsType: [
      PaymentTypeId.cash,
      PaymentTypeId.check,
      PaymentTypeId.cardTerminal,
      PaymentTypeId.transfer,
    ],
  });

  const user = await generators.genUser({});

  await generators.genUserGroup({
    userIdOrEntity: user,
    groupIdOrEntity: group,
  });

  const vendor = await generators.genVendor({});

  const catalog = await generators.genCatalog({
    groupIdOrdEntity: group,
    flags: [CatalogFlags.StockManagement],
    vendorIdOrdEntity: vendor,
  });

  const [product1, product2] = await Promise.all([
    generators.genProduct({
      catalogIdOrEntity: catalog,
      stock: 4,
      price: 1.12,
    }),
    generators.genProduct({
      catalogIdOrEntity: catalog,
      stock: 10,
      price: 0.45,
    }),
  ]);

  ...

  return {
    group,
    user,
    vendor,
    catalog,
    products: product1, product2],
    ...
  }
}

// test e2e

describe("mon test"), () => {
  let generators: DatasetGenerators;

  it("test1", () => {
    const { user, group } = await genTransactionIslet(generators);
    // va générer un îlot
    ...
  })

  it("test2", () => {
    const { user, group } = await genTransactionIslet(generators);
    // va générer un autre îlot
    ...
  })
}
```

## Cli

On peut utiliser la commande `npm run dataset <isletName> [options]`, depuis la racine de `camap-ts`, pour générer un îlot dans la bdd défini par le `.env`.

**/ ! \\ Cette commande doit être exécuté dans le container nest.** En dev utiliser : `docker-compose exec nest npm run dataset <isletName> -- [options]`

**Paramètre**

- `<isletName>` : nom de l'îlot. Doit correspondre au fichier `packages/api-core/src/dev/islets/<isletName>.islet.ts`

**Options**

- `-c, --clean` : permet de supprimer toutes les données de la bdd avant la génération de données.
- `--noFail` : si l'îlot n'existe pas, permet de charger l'îlot par défaut (`packages/api-core/src/dev/islets/dafault.islet.ts`).

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

  return {
    group,
    user
  }
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
    <DatasetProvider
      islet="myIlset"
    >
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
      loginAs={(data) => {
        return data.user.email;
      }}
    >
      <Story />
    </DatasetProvider>
  ),
];
```
