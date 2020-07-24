import { useEffect, useState } from "react";

const useApi = ({ api, deps = [], json = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loader = async () => {
      try {
        setLoading(true);
        const res = await (await fetch(api))[json ? "json" : "text"]();
        setData(res);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    loader();
  }, [...deps, api]);

  return { loading, error, data, setData };
};

export default useApi;
