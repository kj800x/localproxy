import { useCallback, useEffect } from "react";
import Loader from "react-loaders";
import { App } from "./App";
import { useApi } from "../util/useApi";
import { AppType } from "./AppType";

function constructWebsocketUrl(path) {
  const url = new URL(window.location.href);
  return `${url.protocol === "https:" ? "wss" : "ws"}://${url.hostname}${
    url.port ? `:${url.port}` : ""
  }/${path}`;
}

export function Apps({ showSystem }) {
  const {
    data: apps,
    error,
    loading,
    setData: setApps,
    refresh,
  } = useApi<AppType[]>({
    api: "/__proxy__/api",
    deps: [],
  });

  useEffect(() => {
    const socket = new WebSocket(constructWebsocketUrl("__proxy__/api"));
    socket.onmessage = (message) => {
      setApps(JSON.parse(message.data));
    };
  }, [setApps]);

  const deleteApp = useCallback(
    (app: AppType) => {
      fetch("/__proxy__/api", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });
      setTimeout(refresh, 50);
    },
    [refresh]
  );

  const updateApp = useCallback(
    (app: AppType) => {
      fetch("/__proxy__/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      setTimeout(refresh, 50);
    },
    [refresh]
  );

  if (loading) {
    return <Loader type="ball-grid-pulse" active={true} />;
  }

  if (error) {
    return (
      <span className="noRoutes">
        Failed to connect... Is the localproxy server running?
      </span>
    );
  }

  const urlHostname = new URL(window.location.href).hostname;
  const isLocal = urlHostname === "localhost" || urlHostname === "127.0.0.1";

  const filteredApps = apps.filter((app) => showSystem || !app.system);

  if (filteredApps.length === 0) {
    return <span className="noRoutes">No Routes, Just Right</span>;
  }

  return (
    <>
      {filteredApps.map((app) => (
        <App
          key={app.id}
          app={app}
          editable={isLocal}
          draft={false}
          onUpdate={updateApp}
          onDelete={deleteApp}
        />
      ))}
    </>
  );
}
