import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import styled from "styled-components";
import UIIcon from "../util/UIIcon";
import { UIInlineEditor } from "../util/UIInlineEditor";
import { AddRoute } from "./AddRoute";

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

export function AddModal({ close }) {
  const [app, setApp] = useState({
    name: "",
    routes: [],
  });

  return (
    <div className="app draft">
      <h2>
        <UIInlineEditor
          value={app.name}
          onChange={(value) => {
            setApp((a) => ({ ...a, name: value }));
          }}
          placeholder="app-name"
        />
        <div className="app-icon">
          {/* <UIIcon
            color="#6a78d1"
            iconColor="#e5f5f8"
            title="This app will remain between restarts"
            Icon={FaInfinity}
          /> */}
          <UIIcon
            color="#d94c53"
            iconColor="#e5f5f8"
            Icon={MdClose}
            onClick={close}
          />
        </div>
      </h2>
      <RoutesGrid>
        {app.routes.map((route, i) => (
          <AddRoute
            key={i}
            route={route}
            updateRoute={(newRoute) => {
              setApp((app) => ({
                ...app,
                routes: replaceElement(app.routes, i, newRoute),
              }));
            }}
          />
        ))}
      </RoutesGrid>
    </div>
  );
}
