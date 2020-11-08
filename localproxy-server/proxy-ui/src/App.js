import React from "react";
import { FaTools, FaTrash } from "react-icons/fa";
import UIIcon from "./UIIcon";
import Route from "./Route";
import Tag from "./Tag";

function App({ app }) {
  const deleteApp = () => {
    fetch("/__proxy__/api", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id }),
    });
  };

  return (
    <div className="app">
      <h2>
        <a href={app.routes[0].route}>{app.name}</a>
        {app.pid && app.pid > -1 && <Tag color="norman">PID: {app.pid}</Tag>}
        {!app.system && (
          <UIIcon
            color="#d94c53"
            iconColor="#2d3e50"
            Icon={FaTrash}
            onClick={deleteApp}
          />
        )}
        {app.system && (
          <UIIcon iconColor="#2d3e50" color="#00a38d" Icon={FaTools} />
        )}
      </h2>
      <div className="routes">
        {app.routes.map((route) => (
          <Route key={route.route} route={route} />
        ))}
      </div>
    </div>
  );
}

export default App;
