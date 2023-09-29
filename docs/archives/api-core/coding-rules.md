# Coding Rules

## Gestion des entities

On ne peut utiliser un répository que dans le service qui à la responsabilité de cette entité.

Mauvais :

```ts
@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, ProductEntity])],
})
export class GroupsModule {}
```

Bon :

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity]),
    ProductModule, // <- qui export ProductService qui gère la ProductEnity
  ],
  providers: [GroupService], // <- gère GroupEntity
  exports: [GroupService], // <- permet au autres modules d'accéder aux Groups
})
export class GroupsModule {}
```

## Gestion des relations

On gère les relations en lazy.
CF : [doc de TypeOrm](https://github.com/typeorm/typeorm/blob/master/docs/eager-and-lazy-relations.md)

```ts

// example.entity.ts
@Entity('Example')
export class ExampleEntity {
  ...
  @OneToMany(() => PUserCompany, (pUserCompany) => pUserCompany.company)
  pUserCompanies: Promise<PUserCompany[]>;
...
}

// autre part
const example: ExampleEntity = getAnExempleEntity()
const userCompanies: PUserCompany[] = await example.pUserCompanies;

```
