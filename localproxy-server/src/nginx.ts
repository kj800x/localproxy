import fs from "fs";
import { execSync } from "child_process";
// @ts-expect-error nginxbeautifier is untyped
import nginxBeautifier from "nginxbeautifier/nginxbeautifier";
import { LocalproxyConfig, readConfig } from "./config";
import { LocalproxyApp, LocalproxyRoute } from "./types";
import { PROXY_UI_BUILD_FOLDER } from "./util";

type LocalproxyRouteWithApp = LocalproxyRoute & { app: LocalproxyApp };

function pipeSingle<A, B, C>(a: (arg1: A) => B, b: (arg1: B) => C) {
  return (arg: A) => b(a(arg));
}
const pipe = (...ops: ((arg: any) => any)[]) => ops.reduce(pipeSingle);

const format: (contents: string) => string = pipe(
  nginxBeautifier.clean_lines,
  (lines: string[]) => lines.map((line) => line.trim()),
  (lines: string[]) => lines.filter((line) => line),
  nginxBeautifier.join_opening_bracket,
  nginxBeautifier.perform_indentation,
  // nginxBeautifier.perform_alignment,
  (lines) => lines.join("\n") + "\n"
);

const getAllowDeny = (restrictAccess: boolean | undefined) =>
  restrictAccess
    ? `
        limit_except GET {
          allow 127.0.0.1;
          allow ::1;
          deny all;
        }
      `
    : "";

const getTryFiles = (route: LocalproxyRoute) =>
  "rootIndexFallback" in route && route.rootIndexFallback
    ? `
        try_files $uri $uri/ ${route.route}/index.html;
      `
    : "";

const getAutoIndex = (route: LocalproxyRoute) =>
  "dirListings" in route && route.dirListings
    ? `
        autoindex on;
      `
    : "";

// https://serverfault.com/questions/562756/how-to-remove-the-path-with-an-nginx-proxy-pass
// https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias
const getRouteBody = (route: LocalproxyRouteWithApp) => {
  if (route.static) {
    return `
      alias "${route.staticDir}";
      ${getAllowDeny(route.app.system)}
      ${getTryFiles(route)}
      ${getAutoIndex(route)}
    `;
  } else {
    const destinationUrl = `http://${route.hostname}:${route.port}${
      route.trimRoute ? "/" : ""
    }`;
    return `
      proxy_pass ${destinationUrl};
      proxy_set_header Upgrade    $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host       $host;
      proxy_set_header X-Real-IP  $remote_addr;
      ${getAllowDeny(route.app.system)}
    `;
  }
};

const renderRoute = (route: LocalproxyRouteWithApp) => {
  const locationKey = route.route; // ? route.route : `~ ${route.regex}`; TODO regex disabled for now
  const body = getRouteBody(route);

  return `
    location ${locationKey} {
    ${body}
    }
  `;
};

function renderSslBlock(config: LocalproxyConfig) {
  if (!config || !config.ssl || config.ssl === "enabled") {
    return `
      listen 443 ssl http2;
      ssl_certificate /etc/localproxy/localproxy.pem;
      ssl_certificate_key /etc/localproxy/localproxy-key.pem;
    `;
  }
  if (config.ssl === "custom") {
    return `
      listen 443 ssl http2;
      ssl_certificate ${config.sslCert};
      ssl_certificate_key ${config.sslCertKey};
    `;
  }
  if (config.ssl === "disabled") {
    return "";
  }
  throw new Error(`Unexpected config.ssl value: ${config.ssl}`);
}

const template = (routes: LocalproxyRouteWithApp[], config: LocalproxyConfig) =>
  format(`
  log_format scripts '$document_root | $uri | > $request';
  client_max_body_size 20M;

  server {
    access_log /var/log/nginx/scripts.log scripts;

    listen 80;
    listen [::]:80;

    ${renderSslBlock(config)}

    index index.html;

    error_page 403 /403.html;
    location = /403.html {
      root ${PROXY_UI_BUILD_FOLDER}/;
      internal;
    }

    error_page 404 /404.html;
    location = /404.html {
      root ${PROXY_UI_BUILD_FOLDER}/;
      internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
      root ${PROXY_UI_BUILD_FOLDER}/;
      internal;
    }

    add_header Cache-Control no-cache;
    expires -1;

    server_name localproxy;

    ${routes.map(renderRoute).join("\n")}
  }
`);

const buildFinalRoutes = (apps: LocalproxyApp[]): LocalproxyRouteWithApp[] => {
  const routes: { [key: string]: LocalproxyRouteWithApp } = {};

  apps.forEach((app) => {
    app.routes.forEach((route) => {
      if (
        !routes[route.route] ||
        routes[route.route].priority <= route.priority
      ) {
        routes[route.route] = { ...route, app };
      }
    });
  });

  return Object.values(routes);
};

function write(apps: LocalproxyApp[]) {
  const config = readConfig();

  const routes = buildFinalRoutes(apps);

  const content = template(routes, config);
  fs.writeFileSync("/etc/nginx/conf.d/localproxy.conf", content);
}

export function reload() {
  execSync("sudo reload-nginx");
}

export function sync(apps: LocalproxyApp[]) {
  write(apps);
  reload();
}
