import React from "react";

import RouteMapping from "./RouteMapping";

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

export default Route;
