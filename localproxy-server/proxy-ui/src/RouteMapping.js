import React from "react";

import Arrow from "./Arrow";
import Tag from "./Tag";

const colorByType = (type) => {
  switch (type) {
    case "data":
      return "marigold";
    case "ui":
      return "norman";
    case "api":
      return "thunderdome";
    default:
      return "";
  }
};

function RouteMapping({ route }) {
  if (route.static) {
    return (
      <span>
        <a href={route.route}>
          {route.type && (
            <Tag color={colorByType(route.type)}>{route.type}</Tag>
          )}
          <Tag color="oz" hover="Static">
            S
          </Tag>
          {route.route}
        </a>{" "}
        <Arrow /> {route.staticDir}
      </span>
    );
  }
  const target = `http://${route.hostname}:${route.port}`;
  return (
    <span>
      <a href={route.route}>
        {route.type && <Tag color={colorByType(route.type)}>{route.type}</Tag>}
        <Tag color="purple" hover="Dynamic">
          D
        </Tag>
        {route.route}
      </a>{" "}
      <Arrow /> <a href={target}>{target}</a>
    </span>
  );
}

export default RouteMapping;
