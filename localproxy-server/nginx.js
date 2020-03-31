const fs = require("fs");
const { execSync } = require("child_process");
const nginxBeautifier = require("nginxbeautifier/nginxbeautifier");

const pipeSingle = (a, b) => arg => b(a(arg));
const pipe = (...ops) => ops.reduce(pipeSingle);

const format = pipe(
  nginxBeautifier.clean_lines,
  lines => lines.map(line => line.trim()),
  lines => lines.filter(line => line),
  nginxBeautifier.join_opening_bracket,
  nginxBeautifier.perform_indentation,
  // nginxBeautifier.perform_alignment,
  lines => lines.join("\n") + "\n"
);

const getAllowDeny = restrictAccess =>
  restrictAccess
    ? `
        limit_except GET {
          allow 127.0.0.1;
          allow ::1;
          deny all;
        }
      `
    : "";

const getTryFiles = route =>
  route.indexFallback
    ? `
        try_files $uri $uri/ ${route.route}/index.html;
      `
    : "";

const getAutoIndex = route =>
  route.autoIndex
    ? `
        autoindex on;
      `
    : "";

// https://serverfault.com/questions/562756/how-to-remove-the-path-with-an-nginx-proxy-pass
// https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias
const getRouteBody = route => {
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

const renderRoute = route => {
  const locationKey = route.route; // ? route.route : `~ ${route.regex}`; TODO regex disabled for now
  const body = getRouteBody(route);

  return `
    location ${locationKey} {
    ${body}
    }
  `;
};

const template = routes =>
  format(
    `
  log_format scripts '$document_root | $uri | > $request';

  server {
    access_log /var/log/nginx/scripts.log scripts;

    listen 80 default_server;
    listen [::]:80 default_server;

    index index.html;

    error_page 404 /404.html;
    location = /404.html {
      root ` +
      __dirname +
      `/proxy-ui/build/;
      internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
      root ` +
      __dirname +
      `/proxy-ui/build/;
      internal;
    }

    add_header Cache-Control no-cache;
    expires -1;

    server_name localproxy;
${routes.map(renderRoute).join("\n")}
  }
`
  );

const buildFinalRoutes = apps => {
  const routes = {};

  apps.forEach(app => {
    app.routes.forEach(route => {
      if (
        !(routes[route.route] && routes[route.route].priority > route.priority)
      ) {
        routes[route.route] = { ...route, app };
      }
    });
  });

  return Object.values(routes);
};

function write(apps) {
  const routes = buildFinalRoutes(apps);

  const content = template(routes);
  fs.writeFileSync("/etc/nginx/conf.d/localproxy.conf", content);
}

function reload() {
  execSync("sudo reload-nginx");
}

function sync(apps) {
  write(apps);
  reload();
}

module.exports = {
  sync
};
