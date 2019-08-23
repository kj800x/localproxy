import React, { useEffect, useState } from "react";

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

function App({ app }) {
  return (
    <div className="app">
      <h2>{app.title}</h2>
      <div className="routes">
        {app.routes.map(route => (
          <Route key={route.route} route={route} /> // TODO need a key
        ))}
      </div>
    </div>
  );
}

function Apps() {
  const [error, setError] = useState(false);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetch("http://localhost/__proxy__/api")
      .then(res => res.json())
      .then(setApps)
      .catch(setError);
  }, []);

  if (error) {
    return <span>Error! {JSON.stringify(error)}</span>;
  }

  if (apps.length === 0) {
    return <span>No Routes, Just Right</span>;
  }

  return (
    <div className="apps">
      {apps.map(app => (
        <App key={app.id} app={app} />
      ))}
    </div>
  );
}

function ReactApp() {
  return (
    <div className="ReactApp">
      <header>
        <h1>localproxy</h1>
      </header>
      <Apps />
    </div>
  );
}

export default ReactApp;
