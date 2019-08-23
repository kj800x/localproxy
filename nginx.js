const fs = require("fs");
const { execSync } = require("child_process");
const dedent = require("dedent");
const indentString = require("indent-string");
const indent = str => indentString(str, 2);

// https://serverfault.com/questions/562756/how-to-remove-the-path-with-an-nginx-proxy-pass
// https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias
const getRouteBody = route => {
  if (route.static) {
    return dedent(`
      alias ${route.staticDir};
    `);
  } else {
    const destinationUrl = `http://${route.hostname}:${route.port}${
      route.trimRoute ? "/" : ""
    }`;
    return dedent(`
      proxy_pass ${destinationUrl};
      proxy_set_header Host      $host;
      proxy_set_header X-Real-IP $remote_addr;
  `);
  }
};

const renderRoute = route => {
  const locationKey = route.route; // ? route.route : `~ ${route.regex}`; TODO regex disabled for now
  const body = getRouteBody(route);

  return dedent(`
    location ${locationKey} {
    ${indent(body)}
    }
  `);
};

const template = routes =>
  dedent(`
  log_format scripts '$document_root | $uri | > $request';

  server {
    access_log /var/log/nginx/scripts.log scripts;

    listen 80 default_server;
    listen [::]:80 default_server;

    index index.html;

    # TODO Temporarily while debugging proxy-ui
    add_header Access-Control-Allow-Origin *;

    server_name localproxy;
${routes
  .map(renderRoute)
  .map(indent)
  .map(indent)
  .join("\n")}
  }
`);

function write(routes) {
  const content = template(routes);
  console.log(Array(10).join("\n") + content);
  fs.writeFileSync("/etc/localproxy/localproxy.conf", content);
}

function reload() {
  execSync("nginx -s reload");
}

function sync(routes) {
  write(routes);
  reload();
}

module.exports = {
  sync
};
