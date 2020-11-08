import React, { useEffect } from "react";
import Loader from "react-loaders";
import App from "./App";
import useApi from "./useApi";

function constructWebsocketUrl(path) {
  const url = new URL(window.location);
  return `${url.protocol === "https:" ? "wss" : "ws"}://${url.hostname}${
    url.port ? `:${url.port}` : ""
  }/${path}`;
}

function Apps({ showSystem }) {
  const { data: apps, error, loading, setData: setApps } = useApi({
    api: "/__proxy__/api",
    deps: [],
  });

  useEffect(() => {
    const socket = new WebSocket(constructWebsocketUrl("__proxy__/api"));
    socket.onmessage = (message) => {
      setApps(JSON.parse(message.data));
    };
  }, [setApps]);

  if (loading) {
    return <Loader type="ball-grid-pulse" />;
  }

  if (error) {
    return (
      <span className="noRoutes">
        Failed to connect... Is the localproxy server running?
      </span>
    );
  }

  const filteredApps = apps.filter((app) => showSystem || !app.system);

  const renderedApps =
    filteredApps.length === 0 ? (
      <span className="noRoutes">No Routes, Just Right</span>
    ) : (
      filteredApps.map((app) => <App key={app.id} app={app} />)
    );

  return <>{renderedApps}</>;
}

export default Apps;
