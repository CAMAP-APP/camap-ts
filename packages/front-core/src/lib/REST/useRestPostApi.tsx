import { useCallback, useState } from 'react';
import { BASE_URL, HaxeError } from './useRestGetApi';

const useRestPostApi = <TResult extends {}, TBody extends {}>(
  url: string,
  options?: RequestInit,
): [
  (body: TBody, urlParams?: string) => Promise<boolean>,
  { data?: TResult; error?: string },
] => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const execute = useCallback(
    (body: TBody, urlParams?: string) => {
      setError(undefined);
      const promise = fetch(`${BASE_URL}${url}${urlParams || ''}`, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
        headers:{
          'Accept': 'application/json'
        }
      })
        .then(async (response) => {
          if (response.ok) {
            setData(await response.json());
            return true;
          } else {
            const haxeError: HaxeError = JSON.parse(await response.text());
            setError(haxeError.error.message);
            return false;
          }
        })
        .catch((e) => {
          setError(e.message);
          return false;
        });

      return promise;
    },
    [options, url],
  );

  return [execute, { data, error }];
};

export default useRestPostApi;
