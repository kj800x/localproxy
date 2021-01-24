import { useEffect, useMemo, useState } from "react";

function setCache(key, value) {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
}
function readCache(key, value) {
  return localStorage.getItem(key);
}

const useApi = ({ api, deps = [], json = true, cache = false }) => {
  const [loading, setLoading] = useState(
    cache && readCache(api) !== null ? false : true
  );
  const [error, setError] = useState(null);
  const [data, setData] = useState(cache ? readCache(api) : null);

  const loader = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const res = await (await fetch(api))[json ? "json" : "text"]();
        if (cache) {
          setCache(api, res);
        }
        setData(res);
        setLoading(false);
      } catch (e) {
        setError(e);
        if (cache) {
          setCache(api, null);
        }
        setLoading(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, api, cache, json]);

  useEffect(() => {
    loader();
  }, [loader]);

  return { loading, error, data, setData, refresh: loader };
};

export default useApi;
