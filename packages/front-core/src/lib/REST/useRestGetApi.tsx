import { useEffect, useState } from 'react';

export const BASE_URL = `${process.env.CAMAP_HOST}/api`;

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
    fetch(`${BASE_URL}${url}`, {
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
      .catch((err) => {
        setError(err.message);
      });
  }, [url, options]);

  return { data, error };
};

export default useRestGetApi;
