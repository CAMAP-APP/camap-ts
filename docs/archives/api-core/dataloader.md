# Dataloader

[Dataloader](https://github.com/graphql/dataloader) est un utilitaire qui permet d'optimiser le chargement des données grâce au batching et au caching. Et qui permet de résoudre [le problème N+1](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem-in-orm-object-relational-mapping).

- Batching c'est pour grouper des requêtes : "When Dataloader sees that you’re hitting same table multiple times, it’ll batch all calls together i.e. 5 blog posts’ authors & 10 comments’ authors would be batched in a one call."
- Caching c'est pour éviter qu'un même objet soit chargé plusieurs fois dans la même requête : "DataLoader provides a memoization cache for all loads which occur in a single request to your application"

## Utilisation

### Cas classique : loader une entité, par exemple Group

#### 1. Créer un loader à côté du service et du resolver de l'entité en question

group.loader.ts

```ts
import { Injectable, Scope } from '@nestjs/common';
import DataLoader = require('dataloader');
import { NestDataLoader } from '../common/interceptors/dataloader.interceptor';
import { GroupEntity } from './models/group.entity';
import { GroupsService } from './services/groups.service';

// Ne pas oublier de spécifier le scope REQUEST ici
// pour pouvoir utiliser le loader en dehors du module Group.
@Injectable({ scope: Scope.REQUEST })
export class GroupLoader implements NestDataLoader<number, GroupEntity> {
  constructor(private readonly groupsService: GroupsService) {}

  generateDataLoader() {
    return new DataLoader(async (keys: number[]) => {
      const values = await this.groupsService.findByIds(keys);

      // Le mapping est très important pour l'ordre, car chaque index du tableau de valeurs
      // doit correspondre au même index du tableau de clés.
      return keys.map((id) => values.find((g) => g.id === id));
    });
  }
}
```

#### 2. Provide le loader au module

```ts
@Module({
  ...
  providers: [
    GroupsService,
    GroupResolver,
    GroupLoader // Ici
  ],
  exports: [
    GroupsService,
    GroupLoader // N'oubliez pas de l'exporter s'il est utilisé ailleur.
  ]
  ...
})
export class GroupsModule { }
```

#### 2bis. Ajouter le DataLoaderInterceptor au module root

Ceci à déjà été fait dans App.module et n'est plus à changer.

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from './common/interceptors/dataloader.interceptor';

@Module({
  ...
  providers: [
   {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
  ...
})
export class AppModule { }
```

### 3. Usage du loader

Utiliser le loader dans un resolver en l'ajoutant en paramètre de la fonction via le décorateur @Loader.

Charger plusieurs groupes avec loadMany :

```ts
@Resolver(()) => Group)
export class GroupsResolver {

    @Query(() => [Group])
    public getGroups(
        @Args({ name: 'ids', type: () => [Int] }) ids: number[],
        @Loader(GroupLoader) groupLoader: DataLoader<Group['id'], Group>): Promise<Group[]> {
        return groupLoader.loadMany(ids);
    }
}
```

Charger un seul groupe avec load :

```ts
@Resolver(()) => Group)
export class GroupsResolver {

    @Query(() => [Group])
    public getGroup(
        @Args({ name: 'id', type: () => Int }) id: number,
        @Loader(GroupLoader) groupLoader: DataLoader<Group['id'], Group>): Promise<Group> {
        return groupLoader.load(id);
    }
}
```

### Cas d'un resolve field : exemple de l'image d'un produit.

#### 1. Création du loader

Ici, nous voulons charger des images (entité File), nous créons donc un loader file.
Ce loader utilise le FileService pour charger les files, exactement comme dans le premier exemple avec les groupes.

Ce loader est optimisé pour charger que les images d'un produit, ce n'est pas un file loader générique.
C'est-à-dire qu'on va select seulement l'id et le name du File pour optimiser la requête SQL.
Voir également les loaders dans : [tools.loader.ts](../src/tools/tools.loader.ts)

```ts
import { Injectable, Scope } from '@nestjs/common';
import DataLoader = require('dataloader');
import { FileEntity } from '../tools/models/file.entity';
import { NestDataLoader } from '../common/interceptors/dataloader.interceptor';
import { FilesService } from './file.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductImageLoader
  implements NestDataLoader<Number, Pick<FileEntity, 'id' | 'name'>>
{
  constructor(private readonly fileService: FilesService) {}

  generateDataLoader() {
    return new DataLoader(async (ids: number[]) => {
      const files = await this.fileService.findImagesName(ids);

      return ids.map((id) => files.find((f) => f.id === id));
    });
  }
}
```

#### 2. Provide le loader au module

Idem, on ajoute le loader en tant que provider du module file et on l'exporte de ce module pour pouvoir l'utiliser dans le ProductResolver.
Dans le ProductModule, le FilesModule est importé.

### 3. Usage du loader

Dans le ProductResolver :

```ts
  @ResolveField(() => String)
  async image(
    @Parent() parent: Product,
    @Loader(ProductImageLoader) productImageLoader: DataLoader<number, FileEntity>
  ): Promise<string> {
    const file = await productImageLoader.load(parent.imageId);

    return this.filesService.getUrl(file);
  }
```
