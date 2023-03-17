# Gestion des erreurs

Prenons le module nest `test` tel que :

```
  api-core
    - src
      - test
        - test.module.ts
        - test.service.ts
        - test.resolver.ts
        - test.type.ts
      - app.module.ts
```

```TS
// test/test.service.ts

@Injectable()
export class TestService {
  doSomething(id: number) {
    try {
      canFail(id);
    } catch (error) {
      throw new Error(`Fail for this id: ${id}`);
    }

    return { message: "success" };
  }
}
```

```TS
// test/test.type.ts

@ObjectType()
export class Test {
  @Field()
  message: string;
}
```

```TS
// test/test.resolver.ts

@Resolver(() => Test)
export class TestResolver {

  constructor(private readonly testService: TestService) {}

  @Mutation(() => Test)
  doSomething() {
    return this.testService.doSomething();
  }
}
```

Actuellement, si la fonction `canFail` exécutée dans la méthode `doSomething` du service `TestService` produit une erreur, le resolver retournera une erreur 500 (via une `ApolloError`).

Si l'on veut retourner au client une erreur personnalisée, on commence par définir une erreur `DoSomethingError` :

```TS
// test/test-errors.ts

export enum TestErrorType {
  DoSomething = "DoSomething"
  ...
}

export class DoSomethingError extends CamapError {
  constructor(public readonly badId: number) {
    super(TestErrorType.DoSomething)
  }
}

```

Que l'on envoie dans le service :

```TS
// test/test.service.ts
@Injectable()
export class TestService {
  doSomething(id: number) {
    try {
      canFail(id);
    } catch (error) {
      throw new DoSomethingError(id);
    }

    return { message: "success" };
  }
}
```

Maintenant, on va changer le type que va renvoyer la mutation du resolver.

```TS
// test/test.resolver.ts
  ...

  @Mutation(() => DoSomethingResult)
  @MutationFail([TestErrorType.DoSomethingError])
  doSomething() {
    return this.testService.doSomething();
  }

  ...
```

```TS
// test/do-something-result.type.ts

registerEnumType(TestErrorType, {
  name: 'TestErrorType',
});

@ObjectType()
class DoSomethingError {
  @Field(() => TestErrorType)
  type: TestErrorType;

  @Field(() => Int)
  badId: number;
}

export const DoSomethingResult = createUnionType({
  name: 'DoSomethingResult',
  types: () => [Test, DoSomethingError],
  resolveType(value) {
    if (value.type) {
      switch (value.type) {
        case TestErrorType.DoSomething:
          return DoSomethingError;
      }
      return null;
    }
    return Test;
  },
});
```

Quelques explications :

- On a ajouté le décorateur `MutationFail` à la mutation. Il permet d'attraper les `CamapError` dont les types sont renseignés en paramètres et les retournent comme résultat de la mutation.
- on a créé un type `DoSomethingResult`, l'union des types Test (pour les résultats positifs) et DoSomethingError (pour notre erreur). `DoSomethingResult` se résout lui-même en analysant l'objet qu'il reçoit.

On peut maintenant utiliser ce type en front.

```TS

const MyComponent = () => {
  const [doSomething] = useDoSomethingMutation();

  const go = async () => {
    const { data } = await useDoSomethingMutation()

    if (data.doSomething.__typename === "Test") {
      // résultat positif
      console.log(data.doSomething.message);
    }

    if (data.doSomething.__typename === "DoSomethingError") {
      // résultat négatif
      console.log(data.doSomething.badId);
    }
  }

  return <button onClick={go}>CLICK ME</button>
}

```
