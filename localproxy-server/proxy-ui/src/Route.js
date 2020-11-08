import React from "react";

import RouteMapping from "./RouteMapping";

function Route({ route }) {
  return (
    <>
      <div className="route">
        <RouteMapping route={route} />
        <span className="priority">{route.priority}</span>
      </div>

      <ul className="route-details">
        {route.indexFallback && <li>index.html Fallback</li>}
        {route.autoIndex && <li>Directory Listings</li>}
        {route.trimRoute && <li>Trim Route</li>}
      </ul>
    </>
  );
}

export default Route;
