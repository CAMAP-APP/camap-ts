import { useEffect, useState } from 'react';
import { getRestBaseUrl } from 'lib/runtimeCfg';

// BASE_URL = CAMAP_HOST + "/api"
export const BASE_URL = `${getRestBaseUrl().replace(/\/$/, '')}/api`;

export type HaxeError = {
  error: {
    code: number;
    message: string;
  };
};

const useRestGetApi = <T extends {}>(
  url: string,
  options?: RequestInit,
): { data?: T; error?: string } => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const baseNorm = BASE_URL.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    const finalUrl = `${baseNorm}${path}`;

    fetch(finalUrl, {
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
          // Réponse OK : on tente du JSON
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
          // Erreur HTTP : on tente un JSON Haxe, sinon texte brut
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
      .catch((err) => {
        setError(err.message);
      });
  }, [url, options]);

  return { data, error };
};

export default useRestGetApi;
