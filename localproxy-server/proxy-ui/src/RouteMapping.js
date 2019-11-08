import React from "react";

import Arrow from "./Arrow";

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

export default RouteMapping;
