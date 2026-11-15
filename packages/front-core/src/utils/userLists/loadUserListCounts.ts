import { ApolloClient } from '@apollo/client';
import {
  GetUserListCountDocument,
  GetUserListCountQuery,
  GetUserListCountQueryVariables,
  UserList,
} from '../../gql';

// One request at a time keeps expensive counts from competing for the database.
export async function loadUserListCounts(
  client: Pick<ApolloClient<object>, 'query'>,
  groupId: number,
  lists: readonly UserList[],
  signal: AbortSignal,
  onCount: (list: UserList) => void,
  onError: (error: unknown) => void,
): Promise<void> {
  for (const list of lists) {
    if (signal.aborted) return;
    try {
      const { data } = await client.query<
        GetUserListCountQuery,
        GetUserListCountQueryVariables
      >({
        query: GetUserListCountDocument,
        variables: { groupId, listType: list.type },
        fetchPolicy: 'no-cache',
        context: {
          fetchOptions: { signal },
          // A fresh visit must not reuse a request aborted by the previous visit.
          queryDeduplication: false,
        },
      });
      if (signal.aborted) return;
      onCount(data.getUserListCount);
    } catch (error) {
      if (signal.aborted) return;
      onError(error);
    }
  }
}
