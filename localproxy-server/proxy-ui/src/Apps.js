import React, { useEffect, useState } from "react";
import Loader from "react-loaders";
import App from "./App";
import AddModal from "./AddModal";

function Apps({ showSystem, showAddModal, closeModal }) {
  const [error, setError] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await (await fetch("/__proxy__/api")).json();
      setApps(res);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost/__proxy__/api");
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
        <App key={app.id} app={app} refresh={refresh} />
      ))
    );

  return (
    <div className="apps">
      {renderedApps}
      {showAddModal && <AddModal close={closeModal} refresh={refresh} />}
    </div>
  );
}

export default Apps;
