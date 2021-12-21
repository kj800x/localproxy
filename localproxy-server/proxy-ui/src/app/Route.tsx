import { FC } from "react";
import styled from "styled-components";

import { Arrow } from "../util/Arrow";
import { Tag } from "../util/Tag";
import { UIInlineEditor } from "../util/UIInlineEditor";
import {
  AppType,
  DynamicRouteType,
  RouteType,
  StaticRouteType,
} from "./AppType";

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

const LeftTags: FC<{
  route: RouteType;
  index: number;
  editable: boolean;
  updateApp: (updater: (app: AppType) => void) => void;
}> = ({ route, index, editable, updateApp }) => {
  return (
    <a href={route.route}>
      {route.type && (
        <Tag color={colorByType(route.type)} fixedWidth={true}>
          {route.type}
        </Tag>
      )}
      <Tag
        color={route.static ? "oz" : "purple"}
        hover={route.static ? "Static" : "Dynamic"}
      >
        {route.static ? "S" : "D"}
      </Tag>
    </a>
  );
};

const RoutePath: FC<{
  route: RouteType;
  index: number;
  editable: boolean;
  updateApp: (updater: (app: AppType) => void) => void;
}> = ({ route, index, editable, updateApp }) => {
  return (
    <a href={route.route}>
      <OverflowWrap>{route.route}</OverflowWrap>
    </a>
  );
};

const RouteTarget: FC<{
  route: RouteType;
  index: number;
  editable: boolean;
  updateApp: (updater: (app: AppType) => void) => void;
}> = ({ route, index, editable, updateApp }) => {
  if (route.static) {
    return (
      <OverflowWrap>
        <UIInlineEditor
          disabled={!editable}
          value={route.staticDir}
          onChange={(value) => {
            updateApp((app) => {
              (app.routes[index] as StaticRouteType).staticDir = value;
            });
          }}
          placeholder="/"
        />
      </OverflowWrap>
    );
  } else {
    route = route as DynamicRouteType;
    const target = `http://${route.hostname}:${route.port}`;

    const contents = (
      <OverflowWrap>
        http://
        <UIInlineEditor
          disabled={!editable}
          value={route.hostname}
          onChange={(value) => {
            updateApp((app) => {
              (app.routes[index] as DynamicRouteType).hostname = value;
            });
          }}
          placeholder="localhost"
        />
        :
        <UIInlineEditor
          disabled={!editable}
          value={`${route.port}`}
          type="number"
          onChange={(value) => {
            updateApp((app) => {
              if (isNaN(parseInt(value, 10))) {
                return;
              } else {
                (app.routes[index] as DynamicRouteType).port = parseInt(
                  value,
                  10
                );
              }
            });
          }}
          placeholder="80"
        />
      </OverflowWrap>
    );

    if (editable) {
      return <span>{contents}</span>;
    } else {
      return <a href={target}>{contents}</a>;
    }
  }
};

const RightTags: FC<{
  route: RouteType;
  index: number;
  editable: boolean;
  updateApp: (updater: (app: AppType) => void) => void;
}> = ({ route, index, editable, updateApp }) => {
  if (route.static) {
    return (
      <RouteSettingsWrapper>
        <Tag
          disabled={!editable}
          active={route.rootIndexFallback === true}
          hover="Root Index Fallback - If the file isn't found, serve the root /index.html (for single page apps)"
          onClick={() => {
            updateApp((app) => {
              (app.routes[index] as StaticRouteType).rootIndexFallback = !(
                app.routes[index] as StaticRouteType
              ).rootIndexFallback;
            });
          }}
        >
          RIF
        </Tag>
        <Tag
          disabled={!editable}
          active={route.dirListings === true}
          hover="Serve directory listings if the index.html isn't found"
          onClick={() => {
            updateApp((app) => {
              (app.routes[index] as StaticRouteType).dirListings = !(
                app.routes[index] as StaticRouteType
              ).dirListings;
            });
          }}
        >
          DIR
        </Tag>
        <div className="small-screen-tags">
          <LeftTags
            route={route}
            index={index}
            editable={editable}
            updateApp={updateApp}
          />
        </div>
      </RouteSettingsWrapper>
    );
  } else {
    route = route as DynamicRouteType;
    return (
      <RouteSettingsWrapper>
        <Tag
          disabled={!editable}
          active={route.trimRoute === true}
          hover="Trim the matched route before proxying the request"
          onClick={() => {
            updateApp((app) => {
              (app.routes[index] as DynamicRouteType).trimRoute = !(
                app.routes[index] as DynamicRouteType
              ).trimRoute;
            });
          }}
        >
          TRIM
        </Tag>
        <div className="small-screen-tags">
          <LeftTags
            route={route}
            index={index}
            editable={editable}
            updateApp={updateApp}
          />
        </div>
      </RouteSettingsWrapper>
    );
  }
};

const PriorityWrapper = styled.span`
  text-align: right;
`;

const Priority: FC<{
  route: RouteType;
  index: number;
  editable: boolean;
  updateApp: (updater: (app: AppType) => void) => void;
}> = ({ route, editable, index, updateApp }) => {
  return (
    <PriorityWrapper>
      <UIInlineEditor
        value={`${route.priority}`}
        disabled={!editable}
        onChange={(value) => {
          if (isNaN(parseInt(value, 10))) {
            return;
          } else {
            updateApp((app: AppType) => {
              app.routes[index].priority = parseInt(value, 10);
            });
          }
        }}
        type="number"
        placeholder="0"
      />
    </PriorityWrapper>
  );
};

export const Route: FC<{
  route: RouteType;
  index: number;
  updateApp: (updater: (app: AppType) => void) => void;
  editable: boolean;
}> = ({ route, index, updateApp, editable }) => {
  return (
    <>
      <LeftTags
        route={route}
        index={index}
        updateApp={updateApp}
        editable={editable}
      />
      <RoutePath
        route={route}
        index={index}
        updateApp={updateApp}
        editable={editable}
      />
      <Arrow />
      <RouteTarget
        route={route}
        index={index}
        updateApp={updateApp}
        editable={editable}
      />
      <RightTags
        route={route}
        index={index}
        updateApp={updateApp}
        editable={editable}
      />
      <Priority
        route={route}
        index={index}
        updateApp={updateApp}
        editable={editable}
      />
    </>
  );
};
