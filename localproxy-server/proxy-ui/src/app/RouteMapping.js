import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Arrow from "../util/Arrow";
import Tag from "../util/Tag";
import { Tooltip } from "../util/Tooltip";
import UIIcon from "../util/UIIcon";
import TimeAgo from "react-timeago";
import { faInfo } from "@fortawesome/free-solid-svg-icons";

const RouteSettingsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .icon {
    margin-right: 4px;
  }
`;

const OverflowWrap = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  min-width: 100px;
`;

export const ReflowContainer = styled.span``;
export const ArrowContainer = styled.span``;
export const StyledArrow = styled(Arrow)``;

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

const useBuildInfo = (route) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loader() {
      if (!route.static) {
        return;
      }

      const buildInfoPath = `${route.route}${
        route.route.endsWith("/") ? "" : "/"
      }build-info.json`;

      setData(null);
      setError(null);
      setLoading(true);
      const headResponse = await fetch(buildInfoPath, {
        method: "HEAD",
      }).catch(() => null);

      if (!headResponse) {
        setLoading(false);
        return;
      }

      if (
        headResponse.status !== 200 ||
        headResponse.headers.get("content-type") !== "application/json"
      ) {
        setLoading(false);
        setError(new Error("No response for build-info.json file"));
        return;
      }

      const getResponse = await fetch(buildInfoPath, {
        method: "GET",
      });

      const buildInfo = await getResponse.json();

      setData(buildInfo);
      setLoading(false);
    }

    loader();
  }, [route]);

  return { data, loading, error };
};

const BuildInfoTooltipRoot = styled.div`
  p {
    margin: 0;
  }
`;

function BuildInfoTooltip({ buildInfo, route }) {
  return (
    <BuildInfoTooltipRoot>
      <p>
        Built by <b>{buildInfo.build.user}</b>{" "}
        <TimeAgo
          date={buildInfo.build.timestamp}
          title={new Date(buildInfo.build.timestamp).toLocaleString()}
        />{" "}
        on <b>{buildInfo.build.host}</b>{" "}
      </p>
      <br />
      <p>
        commit <b>{buildInfo.commit.commitHash}</b>
      </p>
      {buildInfo.commit.dirty ? (
        <p>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>working tree dirty</i>
        </p>
      ) : null}
      <p>
        author: <b>{buildInfo.commit.authorName}</b> &lt;
        <b>{buildInfo.commit.authorEmail}</b>
        &gt;
      </p>
      <p>
        date:{" "}
        <TimeAgo
          date={buildInfo.commit.commitTimestamp}
          title={new Date(buildInfo.commit.commitTimestamp).toLocaleString()}
        />
      </p>
      <blockquote>{buildInfo.commit.commitMessage}</blockquote>
      <p>
        <a href={`${route.route}/build-info.json`}>raw build info</a>
      </p>
    </BuildInfoTooltipRoot>
  );
}

function RouteMapping({ route, updateRoute }) {
  const urlHostname = new URL(window.location.href).hostname;
  const isLocal = urlHostname === "localhost" || urlHostname === "127.0.0.1";

  const buildInfo = useBuildInfo(route);

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
        <ReflowContainer>
          <a href={route.route}>
            <OverflowWrap>{route.route}</OverflowWrap>
          </a>
          <ArrowContainer>
            <StyledArrow />
            <OverflowWrap>{route.staticDir}</OverflowWrap>
          </ArrowContainer>
        </ReflowContainer>
        <RouteSettingsWrapper>
          {buildInfo.data ? (
            <Tooltip
              overlay={
                <BuildInfoTooltip buildInfo={buildInfo.data} route={route} />
              }
            >
              <UIIcon
                title="Build Info Available"
                iconColor="#e5f5f8"
                color="#6a78d1"
                icon={faInfo}
              />
            </Tooltip>
          ) : null}
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
      <ReflowContainer>
        <a href={route.route}>
          <OverflowWrap>{route.route}</OverflowWrap>
        </a>
        <ArrowContainer>
          <StyledArrow />
          <a href={target}>
            <OverflowWrap>{target}</OverflowWrap>
          </a>
        </ArrowContainer>
      </ReflowContainer>
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

export default RouteMapping;
