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

      const baseNorm = BASE_URL.replace(/\/$/, '');
      const path = url.startsWith('/') ? url : `/${url}`;
      const finalUrl = `${baseNorm}${path}${urlParams || ''}`;

      const promise = fetch(finalUrl, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      })
        .then(async (response) => {
          const rawText = await response.text();

          if (response.ok) {
            if (!rawText) {
              setData(undefined);
              return true;
            }

            try {
              const json = JSON.parse(rawText);
              setData(json as TResult);
              return true;
            } catch {
              setError('Réponse invalide du serveur (JSON attendu).');
              return false;
            }
          } else {
            try {
              const haxeError: HaxeError = JSON.parse(rawText);
              setError(
                haxeError?.error?.message || `Erreur HTTP ${response.status}`,
              );
            } catch {
              const snippet = rawText?.slice(0, 500);
              setError(snippet || `Erreur HTTP ${response.status}`);
            }
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
