import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { loadUserListCounts } from './loadUserListCounts';

describe('progressive user list counts', () => {
  const lists = [
    { type: 'all' },
    { type: 'hasOrders' },
    { type: 'membership' },
  ];
  const createClient = () =>
    new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });
  const result = (type: string, count: number) => ({
    data: { getUserListCount: { type, count } },
    loading: false,
    networkStatus: 7,
  });

  it('updates each count before starting the next request', async () => {
    const client = createClient();
    const calls: string[] = [];
    const query = jest
      .spyOn(client, 'query')
      .mockImplementation(async ({ variables }) => {
        calls.push(`request ${variables?.listType}`);
        return result(
          variables?.listType,
          variables?.listType === 'all' ? 10 : 0,
        );
      });
    const controller = new AbortController();
    const onError = jest.fn();
    await loadUserListCounts(
      client,
      42,
      lists,
      controller.signal,
      (list) => calls.push(`count ${list.type}: ${list.count}`),
      onError,
    );
    expect(calls).toEqual([
      'request all',
      'count all: 10',
      'request hasOrders',
      'count hasOrders: 0',
      'request membership',
      'count membership: 0',
    ]);
    expect(onError).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { groupId: 42, listType: 'all' },
        fetchPolicy: 'no-cache',
        context: {
          fetchOptions: { signal: controller.signal },
          queryDeduplication: false,
        },
      }),
    );
  });

  it('keeps loading other counts after one failure', async () => {
    const client = createClient();
    const failure = new Error('Database unavailable');
    jest
      .spyOn(client, 'query')
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(result('hasOrders', 4))
      .mockResolvedValueOnce(result('membership', 2));
    const onCount = jest.fn();
    const onError = jest.fn();
    await loadUserListCounts(
      client,
      42,
      lists,
      new AbortController().signal,
      onCount,
      onError,
    );
    expect(onError).toHaveBeenCalledWith(failure);
    expect(onCount.mock.calls.map(([list]) => list.type)).toEqual([
      'hasOrders',
      'membership',
    ]);
  });

  it('does not start a request after cancellation', async () => {
    const client = createClient();
    const query = jest.spyOn(client, 'query');
    const controller = new AbortController();
    controller.abort();
    await loadUserListCounts(
      client,
      42,
      lists,
      controller.signal,
      jest.fn(),
      jest.fn(),
    );
    expect(query).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'ignores an in-flight response after cancellation (failure: %s)',
    async (fails) => {
      const client = createClient();
      const controller = new AbortController();
      const query = jest.spyOn(client, 'query').mockImplementation(async () => {
        controller.abort();
        if (fails) throw new Error('AbortError');
        return result('all', 10);
      });
      const onCount = jest.fn();
      const onError = jest.fn();
      await loadUserListCounts(
        client,
        42,
        lists,
        controller.signal,
        onCount,
        onError,
      );
      expect(query).toHaveBeenCalledTimes(1);
      expect(onCount).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    },
  );
});
