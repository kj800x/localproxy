import React, { useEffect, useState } from "react";
import Loader from "react-loaders";
import App from "./App";
import AddModal from "./AddModal";
import useApi from "./useApi";

function constructWebsocketUrl(path) {
  const url = new URL(window.location);
  return `${url.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }${window.location.port ? `:${window.location.port}` : ""}/${path}`;
}

function Apps({ showSystem, showAddModal, closeModal }) {
  const [refresh, setRefresh] = useState(0);
  const doRefresh = () => setRefresh(refresh + 1);

  const { data: apps, error, loading, setData: setApps } = useApi({
    api: "/__proxy__/api",
    deps: [refresh],
  });

  useEffect(() => {
    const socket = new WebSocket(constructWebsocketUrl("__proxy__/api"));
    socket.onmessage = (message) => {
      setApps(JSON.parse(message.data));
    };
  }, [setApps]);

  if (loading) {
    return (
      <div className="apps">
        <Loader type="ball-grid-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="apps">
        <span className="noRoutes">
          Failed to connect... Is the localproxy server running?
        </span>
      </div>
    );
  }

  const filteredApps = apps.filter((app) => showSystem || !app.system);

  const renderedApps =
    filteredApps.length === 0 ? (
      <span className="noRoutes">No Routes, Just Right</span>
    ) : (
      filteredApps.map((app) => (
        <App key={app.id} app={app} refresh={doRefresh} />
      ))
    );

  return (
    <div className="apps">
      {renderedApps}
      {showAddModal && <AddModal close={closeModal} refresh={doRefresh} />}
    </div>
  );
}

export default Apps;
