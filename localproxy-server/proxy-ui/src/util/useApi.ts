import { useEffect, useMemo, useState } from "react";

interface UseApiArgs {
  api: string;
  deps?: any[];
  cache?: boolean;
}

interface UseApiResult<T> {
  loading: boolean;
  error: null | Error;
  data: T;
  setData: (value: T) => void;
  refresh: () => void;
}

function setCache(key: string, value: string | null) {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
}

function readCache(key: string): string | null {
  return localStorage.getItem(key);
}

export const useApi = <T>({
  api,
  deps = [],
  cache = false,
}: UseApiArgs): UseApiResult<T> => {
  const [loading, setLoading] = useState(
    cache && readCache(api) !== null ? false : true
  );
  const [error, setError] = useState<null | Error>(null);
  const [data, setData] = useState<T>(
    cache ? (JSON.parse(readCache(api)) as T) : null
  );

  const loader = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const response = await fetch(api);
        if (!response.ok) {
          setError(new Error(response.statusText));
          setLoading(false);
          return;
        }
        const result = await response.json();
        if (cache) {
          setCache(api, result);
        }
        setData(result);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        if (cache) {
          setCache(api, null);
        }
        setLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, api, cache]);

  useEffect(() => {
    loader();
  }, [loader]);

  return { loading, error, data, setData, refresh: loader };
};

export const usePlaintextApi = ({
  api,
  deps = [],
  cache = false,
}: UseApiArgs): UseApiResult<string> => {
  const [loading, setLoading] = useState(
    cache && readCache(api) !== null ? false : true
  );
  const [error, setError] = useState<null | Error>(null);
  const [data, setData] = useState<string>(cache ? readCache(api) : null);

  const loader = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const response = await fetch(api);
        if (!response.ok) {
          setError(new Error(response.statusText));
          setLoading(false);
          return;
        }
        const result = await response.text();
        if (cache) {
          setCache(api, result);
        }
        setData(result);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        if (cache) {
          setCache(api, null);
        }
        setLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, api, cache]);

  useEffect(() => {
    loader();
  }, [loader]);

  return { loading, error, data, setData, refresh: loader };
};
