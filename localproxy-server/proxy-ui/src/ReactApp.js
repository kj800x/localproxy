import React, { useState } from "react";
import { FaTools, FaPlus } from "react-icons/fa";
import Apps from "./Apps";
import UIIcon from "./UIIcon";
import useApi from "./useApi";

function ReactApp() {
  const { data: hostname } = useApi({
    api: "/__proxy__/api/hostname",
    json: false,
  });
  const [showSystem, setShowSystem] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const urlHostname = new URL(window.location.href).hostname;
  const isLocal = urlHostname === "localhost" || urlHostname === "127.0.0.1";

  return (
    <div className="ReactApp">
      <header>
        <h1>
          <a href="/__proxy__/" className="no-color">
            localproxy {hostname}
          </a>
        </h1>
        {isLocal && (
          <>
            <UIIcon
              color="#6a78d1"
              iconColor="#2d3e50"
              Icon={FaPlus}
              onClick={() => setShowAddModal(true)}
            />
            <UIIcon
              color="#00a38d"
              iconColor={showSystem ? "#e5f5f8" : "#2d3e50"}
              Icon={FaTools}
              onClick={() => setShowSystem(!showSystem)}
            />
          </>
        )}
      </header>
      <Apps
        showSystem={showSystem}
        showAddModal={showAddModal}
        closeModal={() => setShowAddModal(false)}
      />
    </div>
  );
}

export default ReactApp;
