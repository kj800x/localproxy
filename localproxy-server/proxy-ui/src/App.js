import React, { useEffect, useState } from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import Loader from "react-loaders";

function UIModal({ children, close, title }) {
  return (
    <>
      <div className="modal-cover" onClick={close} />
      <div className="modal-container">
        <div className="modal">
          <h3 className="modal-top">
            {title}
            <UIIcon color="#d94c53" icon="❌" onClick={close} />
          </h3>
          <div className="modal-children">{children}</div>
        </div>
      </div>
    </>
  );
}

function UIIcon({ icon, color, onClick, iconColor }) {
  return (
    <span
      className="icon"
      style={{
        background: color,
        cursor: onClick ? "pointer" : "cursor"
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <span className="icon-text" style={iconColor ? { color: iconColor } : {}}>
        {icon}
      </span>
    </span>
  );
}

function Arrow() {
  return <span className="arrow">→</span>;
}

function RouteMapping({ route }) {
  if (route.static) {
    return (
      <span>
        <a href={route.route}>{route.route}</a> <Arrow /> {route.staticDir}
      </span>
    );
  }
  const target = `http://${route.hostname}:${route.port}`;
  return (
    <span>
      <a href={route.route}>{route.route}</a> <Arrow />{" "}
      <a href={target}>{target}</a>
    </span>
  );
}

function Route({ route }) {
  return (
    <div className="route">
      <RouteMapping route={route} />
      <span className="priority">{route.priority}</span>
      <ul className="route-details">
        {route.indexFallback && <li>Root Index Fallback</li>}
        {route.autoIndex && <li>Auto Index</li>}
        {route.trimRoute && <li>Trim Route</li>}
      </ul>
    </div>
  );
}

function App({ app, refresh }) {
  const deleteApp = () => {
    fetch("/__proxy__/api", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id })
    }).then(refresh);
  };

  return (
    <div className="app">
      <h2>
        {app.name}
        {!app.system && <UIIcon color="#d94c53" icon="🗑" onClick={deleteApp} />}
        {app.system && <UIIcon color="#00a38d" icon="🛠" />}
      </h2>
      <div className="routes">
        {app.routes.map(route => (
          <Route key={route.route} route={route} />
        ))}
      </div>
    </div>
  );
}

const Input = ({
  title,
  value,
  placeholder,
  onChange,
  checked,
  type = "text"
}) => {
  return (
    <div className="form-input">
      <label>{title}</label>
      <input
        type={type}
        value={value}
        checked={checked}
        placeholder={placeholder}
        onChange={({ target: { value, checked } }) =>
          onChange(type === "checkbox" ? checked : value)
        }
      />
    </div>
  );
};

const AddStaticAppPanel = ({ name, route, priority, refresh, close }) => {
  const [staticDir, setStaticDir] = useState("");
  const [indexFallback, setIndexFallback] = useState(false);
  const [autoIndex, setAutoIndex] = useState(false);

  const addApp = async () => {
    await fetch("/__proxy__/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: name || "Default Name",
        name: name || "Default Name",
        routes: [
          {
            static: true,
            route: route || "/default/route",
            priority: parseInt(priority) || 0,
            staticDir: staticDir || "/default/static/dir/",
            indexFallback,
            autoIndex
          }
        ]
      })
    });
    close();
    refresh();
  };

  return (
    <div>
      <Input
        title="Static Directory"
        value={staticDir}
        onChange={setStaticDir}
        placeholder="/a/filesystem/path/"
      />
      <Input
        type="checkbox"
        title="Index Fallback"
        value={indexFallback}
        onChange={setIndexFallback}
      />
      <Input
        type="checkbox"
        title="Auto Index"
        value={autoIndex}
        onChange={setAutoIndex}
      />
      <button onClick={addApp}>Add App</button>
    </div>
  );
};

const AddProxyAppPanel = ({ name, route, priority, refresh, close }) => {
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [trimRoute, setTrimRoute] = useState(false);

  const addApp = async () => {
    await fetch("/__proxy__/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: name || "Default Name",
        name: name || "Default Name",
        routes: [
          {
            static: false,
            route: route || "/default/route",
            priority: parseInt(priority) || 0,
            hostname: hostname || "localhost",
            port: port || 80,
            trimRoute
          }
        ]
      })
    });
    close();
    refresh();
  };

  return (
    <div>
      <Input
        title="Hostname"
        value={hostname}
        onChange={setHostname}
        placeholder="localhost"
      />
      <Input title="Port" value={port} onChange={setPort} placeholder={80} />
      <Input
        type="checkbox"
        title="Trim route"
        checked={trimRoute}
        onChange={setTrimRoute}
      />
      <button onClick={addApp}>Add App</button>
    </div>
  );
};

const AddModal = ({ close, refresh }) => {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [priority, setPriority] = useState("0");

  return (
    <UIModal close={close} title="Manually Add App">
      <Input
        title="Name"
        value={name}
        onChange={setName}
        placeholder={"An App Name"}
      />
      <Input
        title="Route"
        value={route}
        onChange={setRoute}
        placeholder={"/a/route"}
      />
      <Input
        title="Priority"
        type="number"
        value={priority}
        onChange={setPriority}
        placeholder={"0"}
      />
      <Tabs>
        <TabList>
          <Tab>Static</Tab>
          <Tab>Proxy</Tab>
        </TabList>
        <TabPanel>
          <AddStaticAppPanel
            name={name}
            route={route}
            priority={priority}
            refresh={refresh}
            close={close}
          />
        </TabPanel>
        <TabPanel>
          <AddProxyAppPanel
            name={name}
            route={route}
            priority={priority}
            refresh={refresh}
            close={close}
          />
        </TabPanel>
      </Tabs>
    </UIModal>
  );
};
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

  const filteredApps = apps.filter(app => showSystem || !app.system);

  const renderedApps =
    filteredApps.length === 0 ? (
      <span className="noRoutes">No Routes, Just Right</span>
    ) : (
      filteredApps.map(app => <App key={app.id} app={app} refresh={refresh} />)
    );

  return (
    <div className="apps">
      {renderedApps}
      {showAddModal && <AddModal close={closeModal} refresh={refresh} />}
    </div>
  );
}

function ReactApp() {
  const [showSystem, setShowSystem] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="ReactApp">
      <header>
        <h1>
          localproxy
          <UIIcon
            color="#6a78d1"
            icon="➕"
            onClick={() => setShowAddModal(true)}
          />
          <UIIcon
            color="#00a38d"
            iconColor={showSystem ? "#e5f5f8" : undefined}
            icon="🛠"
            onClick={() => setShowSystem(!showSystem)}
          />
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
