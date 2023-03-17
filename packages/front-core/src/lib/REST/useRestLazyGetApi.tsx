import { useCallback, useState } from 'react';
import { BASE_URL, HaxeError } from './useRestGetApi';

const useRestLazyGet = <T extends {}>(
  defaultUrl: string,
  options?: RequestInit,
): [
  (urlParams?: string) => Promise<void>,
  { data?: T; error?: string; loading: boolean },
] => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(
    (urlParams?: string) => {
      setLoading(true);
      const promise = fetch(`${BASE_URL}${defaultUrl}${urlParams || ''}`, {
        ...options,
        method: 'GET',
        credentials: 'include',
      })
        .then(async (response) => {
          if (response.ok) {
            setData(await response.json());
            setError(undefined);
          } else {
            const haxeError: HaxeError = JSON.parse(await response.text());
            setError(haxeError.error.message);
          }
        })
        .catch((e) => {
          setError(e.message);
        })
        .finally(() => {
          setLoading(false);
        });

      return promise;
    },
    [options, defaultUrl],
  );

  return [execute, { data, error, loading }];
};

export default useRestLazyGet;
