import React from "react";
import styled from "styled-components";

import Arrow from "../util/Arrow";
import Tag from "../util/Tag";

const RouteSettingsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const OverflowWrap = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  min-width: 100px;
`;

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
const PriorityWrapper = styled.div`
  text-align: right;
`;

function RouteMapping({ route, updateRoute }) {
  const urlHostname = new URL(window.location.href).hostname;
  const isLocal = urlHostname === "localhost" || urlHostname === "127.0.0.1";
  if (route.static) {
    return (
      <>
        <span className="normal-tags">
          <a href={route.route}>
            {route.type && (
              <Tag color={colorByType(route.type)} fixedWidth={true}>
                {route.type}
              </Tag>
            )}
            <Tag color="oz" hover="Static">
              S
            </Tag>
          </a>
        </span>

        <a href={route.route}>
          <OverflowWrap>{route.route}</OverflowWrap>
        </a>
        <Arrow />
        <OverflowWrap>{route.staticDir}</OverflowWrap>
        <RouteSettingsWrapper>
          <Tag
            disabled={!isLocal}
            enabled={route.rootIndexFallback === true}
            hover="Root Index Fallback - If the file isn't found, serve the root /index.html (for single page apps)"
            onClick={() => {
              updateRoute({
                ...route,
                rootIndexFallback: !route.rootIndexFallback,
              });
            }}
          >
            RIF
          </Tag>
          <Tag
            disabled={!isLocal}
            enabled={route.dirListings === true}
            hover="Serve directory listings if the index.html isn't found"
            onClick={() => {
              updateRoute({ ...route, dirListings: !route.dirListings });
            }}
          >
            DIR
          </Tag>
          <div className="small-screen-tags">
            <Tag color="oz" hover="Static">
              S
            </Tag>
            {route.type && (
              <Tag color={colorByType(route.type)} fixedWidth={true}>
                {route.type}
              </Tag>
            )}
          </div>
        </RouteSettingsWrapper>
      </>
    );
  }
  const target = `http://${route.hostname}:${route.port}`;
  return (
    <>
      <span className="normal-tags">
        {route.type && (
          <Tag color={colorByType(route.type)} fixedWidth={true}>
            {route.type}
          </Tag>
        )}
        <Tag color="purple" hover="Dynamic">
          D
        </Tag>
      </span>
      <a href={route.route}>
        <OverflowWrap>{route.route}</OverflowWrap>
      </a>
      <Arrow />
      <a href={target}>
        <OverflowWrap>{target}</OverflowWrap>
      </a>
      <RouteSettingsWrapper>
        <Tag
          disabled={!isLocal}
          enabled={route.trimRoute === true}
          hover="Trim the matched route before proxying the request"
          onClick={() => {
            updateRoute({ ...route, trimRoute: !route.trimRoute });
          }}
        >
          TRIM
        </Tag>
        <div className="small-screen-tags">
          <a href={route.route}>
            <Tag color="purple" hover="Dynamic">
              D
            </Tag>
            {route.type && (
              <Tag color={colorByType(route.type)} fixedWidth={true}>
                {route.type}
              </Tag>
            )}
          </a>
        </div>
      </RouteSettingsWrapper>
    </>
  );
}

export function AddRoute({ route, updateRoute }) {
  return (
    <>
      <RouteMapping route={route} updateRoute={updateRoute} />
      <PriorityWrapper>{route.priority}</PriorityWrapper>
    </>
  );
}
