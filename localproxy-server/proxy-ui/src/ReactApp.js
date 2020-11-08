import React, { useState } from "react";
import { FaTools, FaPlus, FaLock } from "react-icons/fa";
import Apps from "./Apps";
import UIIcon from "./UIIcon";
import useApi from "./useApi";
import { SslSettings } from "./SslSettings";
import AddModal from "./AddModal";
import UIModal from "./UIModal";

function ReactApp() {
  const { data: hostname } = useApi({
    api: "/__proxy__/api/hostname",
    json: false,
    cache: true,
  });
  const [showSystem, setShowSystem] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSslSettings, setShowSslSettings] = useState(false);
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
              iconColor={showSslSettings ? "#e5f5f8" : "#2d3e50"}
              Icon={FaLock}
              onClick={() => setShowSslSettings(!showSslSettings)}
            />
            <UIIcon
              color="#6a78d1"
              iconColor={showAddModal ? "#e5f5f8" : "#2d3e50"}
              Icon={FaPlus}
              onClick={() => setShowAddModal(!showAddModal)}
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
      <div className="content">
        {showSslSettings && (
          <UIModal
            close={() => setShowSslSettings(false)}
            title="Configure SSL"
          >
            <SslSettings />
          </UIModal>
        )}
        {showAddModal && <AddModal close={() => setShowAddModal(false)} />}
        <Apps showSystem={showSystem} />
      </div>
    </div>
  );
}

export default ReactApp;
