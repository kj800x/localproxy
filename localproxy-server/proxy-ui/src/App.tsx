import { useState } from "react";
import { FaTools, FaPlus, FaLock } from "react-icons/fa";
// import { Apps } from "./app/Apps";
import { UIIcon } from "./util/UIIcon";
import { usePlaintextApi } from "./util/useApi";
import { SslSettings } from "./ssl/SslSettings";
import { AddSection } from "./add/AddSection";
import { UIModal } from "./util/UIModal";
import { Apps } from "./app/Apps";

export function App() {
  const { data: hostname } = usePlaintextApi({
    api: "/__proxy__/api/hostname",
    cache: true,
  });
  const [showSystem, setShowSystem] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSslSettings, setShowSslSettings] = useState<boolean>(false);
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
          Icon={FaLock}
          onClick={() => setShowSslSettings(!showSslSettings)}
        />
        {isLocal && (
          <>
            <UIIcon
              color="#6a78d1"
              iconColor={showAddSection ? "#e5f5f8" : "#2d3e50"}
              Icon={FaPlus}
              onClick={() => setShowAddSection(!showAddSection)}
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
            <SslSettings isLocal={isLocal} hostname={hostname} />
          </UIModal>
        )}
        {showAddSection && (
          <AddSection close={() => setShowAddSection(false)} />
        )}
        <Apps showSystem={showSystem} />
      </div>
    </div>
  );
}
