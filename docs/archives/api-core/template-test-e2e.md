# Template d'un test e2e

```TS
import { afterEach_e2e, beforeEach_e2e, createApolloClient, TestContextHelper } from './utils';
import { USERS } from './dataset';

describe('Create user (e2e)', () => {
  let testHelper: TestContextHelper;

  beforeEach(async () => {
    testHelper = await beforeEach_e2e();
  });

  afterEach(async () => {
    await afterEach_e2e(testHelper);
  });

  it('nom du test', async () => {
    let { query, mutation } = createApolloClient(testHelper, USERS.francois);

    const { data: myQueryData, errors: myQueryError } = await query({
      query: MY_QUERY,
      variables: {...}
    });

    expect(myQueryError).toBe..
    expect(myQueryData).toBe..importe le importe le dataset le datasetaset

    const { data: myMutationData, errors: myMutationErrors } = await mutation({
      query: MY_MUTATION,
      variables: {...}
    });

    expect(myMutationErrors).toBe...
    expect(myMutationData).toBe...
  });
});
```

1 - `beforeEach` importe le dataset et initialise l'app Nest en récupérant un objet `TestContextHelper`.

2 - le test est éxécuté, les fonctions `query` et `mutation` sont récupérées via la méthode `createApolloClient`, elles permettent d'effectuer de requêtes authentifiées ou non. (createApolloClient prend comme second paramètre optionnel, une instance d'UserEntity, qui intègre un jwt à la requête)

3- `afterEach` surpprime l'app Nest
