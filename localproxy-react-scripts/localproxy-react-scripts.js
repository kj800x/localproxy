#!/usr/bin/env node

const localproxy = require("@kj800x/localproxy-client");
const process = require("process");
const execa = require("execa");
const path = require("path");

const CWD = process.cwd();
const reactScriptsBin = require.resolve(".bin/react-scripts", { paths: [CWD] });

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

function readPackageJson() {
  try {
    return require(path.join(CWD, "package.json"));
  } catch (e) {
    if (e.message.includes("Cannot find module")) {
      return null;
    } else {
      throw e;
    }
  }
}

function processRoutesJson(packageJson, routesJson, reactScriptsPort) {
  return {
    id: routesJson.id || routesJson.name || packageJson.name || CWD,
    name: routesJson.name || packageJson.name || path.basename(CWD),
    pid: process.pid,
    routes: [
      {
        static: false,
        route: "/",
        hostname: "127.0.0.1",
        port: reactScriptsPort,
        trimRoute: false,
        priority: 100,
      },
      ...(routesJson.routes || []).map((route) => ({
        ...route,
        priority: route.priority || 0,
        staticDir: route.staticDir
          ? path.resolve(CWD, route.staticDir) + "/"
          : undefined,
      })),
    ],
  };
}

async function runStart() {
  const port = await localproxy.getAvailablePort();

  const localproxyApp = processRoutesJson(
    readPackageJson() || {},
    readRoutesJson() || {},
    port
  );

  await localproxy.register(localproxyApp);

  process.on("SIGINT", async () => {
    await localproxy.deregister(localproxyApp);
  });

  await execa(reactScriptsBin, ["start"], {
    env: { PORT: port, BROWSER: "none" },
    stdio: "inherit",
    reject: false,
  });
}

async function runBuild() {
  await execa("sed", ["-i", "s/##homepage/homepage/g", "package.json"]);

  try {
    await runDirect("build");
  } catch (e) {
    console.error("react-scripts build had unexpected error", e);
  } finally {
    await execa("sed", ["-i", "s/homepage/##homepage/g", "package.json"]);
  }
}

async function runEject() {
  await execa("sed", [
    "-i",
    "s/localproxy-react-scripts/react-scripts/g",
    "package.json",
  ]);

  try {
    await runDirect("eject");
  } catch (e) {
    console.error("react-scripts eject had unexpected error", e);
  }
}

async function runDirect(command) {
  await execa(reactScriptsBin, [command], {
    stdio: "inherit",
    reject: false,
  });
}

async function main() {
  const command = process.argv[2];
  switch (command) {
    case "start":
      return await runStart();
    case "build":
      return await runBuild();
    case "eject":
      return await runEject();
    case "test":
      return await runDirect("test");
    default:
      console.error(
        `localproxy-react-scripts ${command}: unrecognized command`
      );
      return await runDirect(command);
  }
}

main().catch(console.error);
