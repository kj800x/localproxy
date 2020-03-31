import React, { useState } from "react";
import { FaTools, FaPlus } from "react-icons/fa";
import Apps from "./Apps";
import UIIcon from "./UIIcon";

function ReactApp() {
  const [showSystem, setShowSystem] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const hostname = new URL(window.location.href).hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  return (
    <div className="ReactApp">
      <header>
        <h1>
          <a href="/__proxy__/" class="no-color">
            localproxy
          </a>
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
        </h1>
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
