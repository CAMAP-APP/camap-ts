// packages/front-core/src/lib/REST/useRestGetApi.tsx

import { useEffect, useState } from 'react';
import { getRestBaseUrl } from 'lib/runtimeCfg';

export const BASE_URL = getRestBaseUrl();

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
    const base = getRestBaseUrl(); // on relit la cfg au cas où
    const baseNorm = base.replace(/\/$/, '');
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
        if (response.ok) {
          setData(await response.json());
          setError(undefined);
        } else {
          const haxeError: HaxeError = JSON.parse(await response.text());
          setError(haxeError.error.message);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [url, options]);

  return { data, error };
};

export default useRestGetApi;
