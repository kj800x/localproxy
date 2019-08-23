import React, { useEffect, useState } from "react";

function UIIcon({ icon, color, onClick }) {
  return (
    <span
      className="icon"
      style={{
        background: color,
        cursor: onClick ? "pointer" : "cursor"
      }}
      onClick={onClick}
    >
      <span className="icon-text">{icon}</span>
    </span>
  );
}

function Arrow() {
  return <span className="arrow">→</span>;
}

function Route({ route }) {
  if (route.static) {
    return (
      <div className="route">
        <a href={route.route}>{route.route}</a> <Arrow /> {route.staticDir}
      </div>
    );
  } else {
    const target = `http://${route.hostname}:${route.port}`;
    return (
      <div className="route">
        <a href={route.route}>{route.route}</a> <Arrow />{" "}
        <a href={target}>{target}</a>
      </div>
    );
  }
}

function App({ app, refresh }) {
  const deleteApp = () => {
    fetch("http://localhost/__proxy__/api", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id })
    }).then(refresh);
  };

  return (
    <div className="app">
      <h2>
        {app.title}
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

function Apps({ showSystem }) {
  const [error, setError] = useState(false);
  const [apps, setApps] = useState([]);

  const refresh = () => {
    fetch("http://localhost/__proxy__/api")
      .then(res => res.json())
      .then(setApps)
      .catch(setError);
  };

  useEffect(refresh, []);

  if (error) {
    return <span>Error! {JSON.stringify(error)}</span>;
  }

  const renderedApps = apps.filter(app => showSystem || !app.system);

  if (renderedApps.length === 0) {
    return (
      <div className="apps">
        <span className="noRoutes">No Routes, Just Right</span>
      </div>
    );
  }

  return (
    <div className="apps">
      {renderedApps.map(app => (
        <App key={app.id} app={app} refresh={refresh} />
      ))}
    </div>
  );
}

function ReactApp() {
  const [showSystem, setShowSystem] = useState(false);

  return (
    <div className="ReactApp">
      <header>
        <h1>
          localproxy
          <UIIcon color="#6a78d1" icon="➕" />
          <UIIcon
            color="#00a38d"
            icon="🛠"
            onClick={() => setShowSystem(!showSystem)}
          />
        </h1>
      </header>
      <Apps showSystem={showSystem} />
    </div>
  );
}

export default ReactApp;
