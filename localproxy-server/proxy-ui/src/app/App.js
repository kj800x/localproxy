import React from "react";
import UIIcon from "../util/UIIcon";
import Route from "./Route";
import Tag from "../util/Tag";
import styled from "styled-components";
import { ArrowContainer, ReflowContainer, StyledArrow } from "./RouteMapping";
import {
  faInfinity,
  faTools,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const RoutesGrid = styled.div`
  display: grid;

  grid-template-columns: auto auto auto 1fr auto auto;
  column-gap: 2px;
  row-gap: 4px;
  align-items: center;
  justify-content: center;

  .normal-tags {
    display: block;
    user-select: none;
  }

  .small-screen-tags {
    display: none;
    user-select: none;
  }

  ${ReflowContainer} {
    display: contents;
  }

  ${ArrowContainer} {
    display: contents;
  }

  ${StyledArrow} {
    user-select: none;
  }

  @media screen and (max-width: 670px) {
    grid-template-columns: auto auto auto 1fr auto auto;

    ${ReflowContainer} {
      font-size: small;
    }

    ${ArrowContainer} {
      font-size: x-small;
    }
  }

  @media screen and (max-width: 544px) {
    .normal-tags {
      display: none;
    }

    grid-template-columns: 1fr auto auto;

    .small-screen-tags {
      display: contents;
    }

    ${ReflowContainer} {
      font-size: small;
      display: block;
      display: flex;
      flex-direction: column;
    }

    ${ArrowContainer} {
      font-size: x-small;
      display: block;
      position: relative;
      ${StyledArrow} {
        display: none;
      }
      margin-left: 12px;
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
          {app.persist && (
            <UIIcon
              color="#6a78d1"
              iconColor="#e5f5f8"
              title="This app will remain between restarts"
              icon={faInfinity}
            />
          )}
          {app.system && (
            <UIIcon
              title="This app is essential for the localproxy system"
              iconColor="#e5f5f8"
              color="#00a38d"
              icon={faTools}
            />
          )}
          {!app.system && isLocal && (
            <UIIcon
              color="#d94c53"
              iconColor="#e5f5f8"
              icon={faTrash}
              onClick={deleteApp}
            />
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
