import React from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  ApolloQueryResult,
  InMemoryCache,
} from '@apollo/client';
import { createRoot, Root } from 'react-dom/client';
import { act as domAct } from 'react-dom/test-utils';
import { GetUserListCountQuery, UserList } from '../../gql';
import { useProgressiveUserLists } from './useProgressiveUserLists';

const act = React.act ?? domAct;

describe('progressive list count lifecycle', () => {
  let host: HTMLDivElement;
  let root: Root;
  let client: ApolloClient<object>;
  let pending: {
    signal: AbortSignal;
    groupId: number;
    resolve: (value: ApolloQueryResult<GetUserListCountQuery>) => void;
  }[];
  const initialLists: UserList[] = [{ type: 'all' }, { type: 'membership' }];
  const result = (
    type: string,
    count: number,
  ): ApolloQueryResult<GetUserListCountQuery> => ({
    data: { getUserListCount: { type, count } },
    loading: false,
    networkStatus: 7,
  });
  function TestLists({
    groupId = 1,
    lists = initialLists,
    revision,
  }: {
    groupId?: number;
    lists?: UserList[];
    revision?: boolean;
  }) {
    const state = useProgressiveUserLists(groupId, lists, revision);
    return (
      <div>
        {state.lists?.map((list) => (
          <p key={list.type}>
            {list.type}: {list.count ?? '?'}
          </p>
        ))}
      </div>
    );
  }
  const render = async (props = {}) => {
    await act(async () =>
      root.render(
        <ApolloProvider client={client}>
          <TestLists {...props} />
        </ApolloProvider>,
      ),
    );
  };

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.empty(),
    });
    pending = [];
    jest.spyOn(client, 'query').mockImplementation(
      ({ context, variables }) =>
        new Promise((resolve) => {
          pending.push({
            signal: context?.fetchOptions.signal,
            groupId: variables?.groupId,
            resolve,
          });
        }),
    );
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
  });

  it('shows names before counts and stops when unmounted', async () => {
    await render();
    expect(host.textContent).toBe('all: ?membership: ?');
    expect(pending).toHaveLength(1);
    await act(async () => pending[0].resolve(result('all', 12)));
    expect(host.textContent).toBe('all: 12membership: ?');
    expect(pending).toHaveLength(2);
    await act(async () => root.render(null));
    expect(pending[1].signal.aborted).toBe(true);
  });

  it('ignores the old visit after a refresh or group change', async () => {
    await render();
    await act(async () => pending[0].resolve(result('all', 12)));
    await render({ groupId: 2, revision: true });
    expect(pending[1].signal.aborted).toBe(true);
    expect(pending[2].groupId).toBe(2);
    expect(host.textContent).toBe('all: ?membership: ?');
    await act(async () => pending[1].resolve(result('membership', 9)));
    expect(host.textContent).toBe('all: ?membership: ?');
    await act(async () => pending[2].resolve(result('all', 5)));
    expect(host.textContent).toBe('all: 5membership: ?');
  });

  it('cancels when leaving the document and restarts after browser back restoration', async () => {
    await render();
    await act(async () =>
      window.dispatchEvent(new PageTransitionEvent('pagehide')),
    );
    expect(pending[0].signal.aborted).toBe(true);
    await act(async () =>
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true }),
      ),
    );
    expect(pending).toHaveLength(2);
    expect(pending[1].signal.aborted).toBe(false);
  });
});
