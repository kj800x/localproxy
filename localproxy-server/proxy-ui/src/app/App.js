import React from "react";
import { FaTools, FaTrash } from "react-icons/fa";
import UIIcon from "../util/UIIcon";
import Route from "./Route";
import Tag from "../util/Tag";
import styled from "styled-components";

const RoutesGrid = styled.div`
  display: grid;

  grid-template-columns: auto auto auto 1fr auto auto;
  column-gap: 2px;
  row-gap: 4px;
  align-items: center;
  justify-content: center;

  .normal-tags {
    display: block;
  }

  .small-screen-tags {
    display: none;
  }

  @media screen and (max-width: 490px) {
    .normal-tags {
      display: none;
    }

    grid-template-columns: auto auto 1fr auto auto;

    .small-screen-tags {
      display: contents;
    }
  }
`;

const replaceElement = (arr, idx, elem) => {
  const copy = [...arr];
  copy[idx] = elem;
  return copy;
};

function App({ app, refresh }) {
  const deleteApp = () => {
    fetch("/__proxy__/api", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id }),
    });
    setTimeout(refresh, 50);
  };
  const updateApp = (newApp) => {
    fetch("/__proxy__/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApp),
    });
    setTimeout(refresh, 50);
  };
  const urlHostname = new URL(window.location.href).hostname;
  const isLocal = urlHostname === "localhost" || urlHostname === "127.0.0.1";

  return (
    <div className="app">
      <h2>
        <a href={app.routes[0].route}>{app.name}</a>
        <div className="app-icon">
          {app.pid && app.pid > -1 && (
            <Tag color="norman" style={{ marginTop: -2 }}>
              PID: {app.pid}
            </Tag>
          )}
          {!app.system && isLocal && (
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
        </div>
      </h2>
      <RoutesGrid>
        {app.routes.map((route, i) => (
          <Route
            key={route.route}
            route={route}
            updateRoute={(newRoute) => {
              updateApp({
                ...app,
                routes: replaceElement(app.routes, i, newRoute),
              });
            }}
          />
        ))}
      </RoutesGrid>
    </div>
  );
}

export default App;
