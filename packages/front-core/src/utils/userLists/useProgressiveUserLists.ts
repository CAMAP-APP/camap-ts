import { ApolloError, useApolloClient } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { UserList } from '../../gql';
import { loadUserListCounts } from './loadUserListCounts';

export function useProgressiveUserLists(
  groupId: number,
  initialLists: readonly UserList[] | undefined,
  revision?: boolean,
) {
  const client = useApolloClient();
  const [visit, setVisit] = useState(0);
  const [progress, setProgress] = useState<{
    groupId: number;
    source: readonly UserList[] | undefined;
    revision: boolean | undefined;
    visit: number;
    counts: Record<string, UserList>;
    error?: ApolloError;
  }>({ groupId, source: initialLists, revision, visit, counts: {} });

  useEffect(() => {
    setProgress({ groupId, source: initialLists, revision, visit, counts: {} });
    if (!initialLists) return;
    const controller = new AbortController();
    const cancel = () => controller.abort();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setVisit((previous) => previous + 1);
    };
    window.addEventListener('pagehide', cancel);
    window.addEventListener('pageshow', onPageShow);
    void loadUserListCounts(
      client,
      groupId,
      initialLists,
      controller.signal,
      (list) => {
        setProgress((previous) => ({
          ...previous,
          counts: { ...previous.counts, [list.type]: list },
        }));
      },
      (cause) =>
        setProgress((previous) => ({
          ...previous,
          error:
            cause instanceof ApolloError
              ? cause
              : new ApolloError({
                  networkError:
                    cause instanceof Error ? cause : new Error(String(cause)),
                }),
        })),
    );
    return () => {
      cancel();
      window.removeEventListener('pagehide', cancel);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [client, groupId, initialLists, revision, visit]);

  const isCurrent =
    progress.groupId === groupId &&
    progress.source === initialLists &&
    progress.revision === revision &&
    progress.visit === visit;

  const lists = useMemo(
    () =>
      initialLists?.map(
        (list) => (isCurrent && progress.counts[list.type]) || list,
      ),
    [initialLists, progress.counts, isCurrent],
  );
  return { lists, error: isCurrent ? progress.error : undefined };
}
