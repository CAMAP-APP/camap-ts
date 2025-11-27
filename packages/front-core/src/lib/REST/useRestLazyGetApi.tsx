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

      const baseNorm = BASE_URL.replace(/\/$/, '');
      const path = defaultUrl.startsWith('/') ? defaultUrl : `/${defaultUrl}`;
      const finalUrl = `${baseNorm}${path}${urlParams || ''}`;

      const promise = fetch(finalUrl, {
        ...options,
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(options?.headers || {}),
        },
      })
        .then(async (response) => {
          const rawText = await response.text();

          if (response.ok) {
            if (!rawText) {
              setData(undefined);
              setError(undefined);
              return;
            }

            try {
              const json = JSON.parse(rawText);
              setData(json as T);
              setError(undefined);
            } catch {
              setError('Réponse invalide du serveur (JSON attendu).');
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
