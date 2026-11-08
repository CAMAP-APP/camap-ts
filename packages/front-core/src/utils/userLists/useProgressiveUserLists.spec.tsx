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
  let table: jest.SpyInstance;
  let pending: {
    signal: AbortSignal;
    groupId: number;
    resolve: (value: ApolloQueryResult<GetUserListCountQuery>) => void;
  }[];
  const initialLists: UserList[] = [{ type: 'all' }, { type: 'membership' }];
  const result = (
    type: string,
    count: number,
    durationMs = 1,
  ): ApolloQueryResult<GetUserListCountQuery> => ({
    data: { getUserListCount: { type, count, durationMs } },
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
    window.history.replaceState(null, '', '/member');
    table = jest.spyOn(console, 'table').mockImplementation(() => {});
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
    table.mockRestore();
    window.history.replaceState(null, '', '/member');
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

  it('prints server durations only after all counts finish when profiling is enabled', async () => {
    window.history.replaceState(null, '', '/member?profileUserLists=1');
    await render();
    await act(async () => pending[0].resolve(result('all', 12, 2)));
    expect(table).not.toHaveBeenCalled();
    await act(async () => pending[1].resolve(result('membership', 9, 5)));
    expect(table).toHaveBeenCalledTimes(1);
    expect(table).toHaveBeenCalledWith([
      { type: 'all', durationMs: 2 },
      { type: 'membership', durationMs: 5 },
    ]);
  });

  it('does not print durations without opting in', async () => {
    await render();
    await act(async () => pending[0].resolve(result('all', 12)));
    await act(async () => pending[1].resolve(result('membership', 9)));
    expect(table).not.toHaveBeenCalled();
  });

  it('does not print an incomplete table after leaving the page', async () => {
    window.history.replaceState(null, '', '/member?profileUserLists=1');
    await render();
    await act(async () => pending[0].resolve(result('all', 12)));
    await act(async () => root.render(null));
    await act(async () => pending[1].resolve(result('membership', 9)));
    expect(table).not.toHaveBeenCalled();
  });
});
