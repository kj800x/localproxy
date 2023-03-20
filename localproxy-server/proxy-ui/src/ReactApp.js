import React, { useState } from "react";
import Apps from "./app/Apps";
import UIIcon from "./util/UIIcon";
import useApi from "./util/useApi";
import { SslSettings } from "./ssl/SslSettings";
import AddModal from "./add/AddModal";
import UIModal from "./util/UIModal";
import { faLock, faPlus, faTools } from "@fortawesome/free-solid-svg-icons";

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
        <UIIcon
          color="#6a78d1"
          iconColor={showSslSettings ? "#e5f5f8" : "#2d3e50"}
          icon={faLock}
          onClick={() => setShowSslSettings(!showSslSettings)}
        />
        {isLocal && (
          <>
            <UIIcon
              color="#6a78d1"
              iconColor={showAddModal ? "#e5f5f8" : "#2d3e50"}
              icon={faPlus}
              onClick={() => setShowAddModal(!showAddModal)}
            />
            <UIIcon
              color="#00a38d"
              iconColor={showSystem ? "#e5f5f8" : "#2d3e50"}
              icon={faTools}
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
            <SslSettings isLocal={isLocal} hostname={hostname} />
          </UIModal>
        )}
        {showAddModal && <AddModal close={() => setShowAddModal(false)} />}
        <Apps showSystem={showSystem} />
      </div>
    </div>
  );
}

export default ReactApp;
