#!/usr/bin/env node

const localproxy = require("@kj800x/localproxy-client");
const net = require("net");
const reactScriptsBin = require.resolve(".bin/react-scripts");
const execa = require("execa");
const path = require("path");
const process = require("process");

const CWD = process.cwd();

const DEFAULT_ROUTES_JSON = {
  id: CWD,
  name: path.basename(CWD),
  routes: []
};

const getAvailablePort = options =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(options, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });

function readRoutesJson() {
  try {
    return require(path.join(CWD, "routes.json"));
  } catch (e) {
    if (e.message.includes("Cannot find module")) {
      return null;
    } else {
      throw e;
    }
  }
}

function processRoutesJson(routesJson, reactScriptsPort) {
  return {
    id: routesJson.id || routesJson.name || CWD,
    name: routesJson.name || path.basename(CWD),
    routes: [
      {
        static: false,
        route: "/",
        hostname: "localhost",
        port: reactScriptsPort,
        trimRoute: false,
        priority: 100
      },
      ...(routesJson.routes || []).map(route => ({
        ...route,
        priority: route.priority || 0,
        staticDir: route.staticDir
          ? path.resolve(CWD, route.staticDir) + "/"
          : undefined
      }))
    ]
  };
}

async function main() {
  const port = await getAvailablePort();

  const localproxyApp = processRoutesJson(
    readRoutesJson() || DEFAULT_ROUTES_JSON,
    port
  );

  await localproxy.register(localproxyApp);

  process.on("SIGINT", async () => {
    await localproxy.deregister(localproxyApp);
  });

  await execa(reactScriptsBin, ["start"], {
    env: { PORT: port, BROWSER: "none" },
    stdio: "inherit",
    reject: false
  });
}

main().catch(console.error);
