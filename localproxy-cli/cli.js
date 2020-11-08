#!/usr/bin/env node

const path = require("path");
const process = require("process");

const localproxy = require("@kj800x/localproxy-client");

const CWD = process.cwd();

const USAGE_STRING = `Usage: localproxy [OPTION]

Serves a webapp based on a routes.json in the current
directory if it exists or serves the current directory.

All options are for for serving the current directory:
  --route                serve at a specific route
                           [default: /]
  --id                   specify a specific localproxy id
  --name                 set the display name in the localproxy ui
  --name                 set the priority
                           [default: 0]
  --quiet                do not show the localproxy app configuration
  --no-index-fallback    do not enable index fallback
                           (serve index.html when the user
                            navigates to a directory)
  --no-auto-index        do not enable auto index
                           (automatic directory listings)
  --help, -h             show this help text`;

function parseArgv() {
  const flag = (x) => process.argv.includes(x);
  const namedArg = (x) =>
    process.argv.includes(x) ? process.argv[process.argv.indexOf(x) + 1] : null;

  if (flag("--help") || flag("-h")) {
    console.log(USAGE_STRING);
    process.exit(1);
  }

  return {
    route: namedArg("--route"),
    id: namedArg("--id"),
    name: namedArg("--name"),
    priority: namedArg("--priority"),
    quiet: flag("--quiet"),
    noIndexFallback: flag("--no-index-fallback"),
    noAutoIndex: flag("--no-auto-index"),
  };
}

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

function processRoutesJson(routesJson, args) {
  return {
    id: args.id || routesJson.id || routesJson.name || CWD,
    name: args.name || routesJson.name || path.basename(CWD),
    routes: routesJson.routes.map((route) => ({
      ...route,
      priority: args.priority
        ? parseInt(args.priority, 10)
        : route.priority || 0,
      staticDir: route.staticDir
        ? path.resolve(CWD, route.staticDir) + "/"
        : undefined,
    })),
  };
}

function buildServeCwdApp(args) {
  return {
    id: args.id || CWD,
    name: args.name || path.basename(CWD),
    routes: [
      {
        static: true,
        route: args.route || "/",
        staticDir: CWD + "/",
        priority: args.priority ? parseInt(args.priority, 10) : 0,
        indexFallback: !args.noIndexFallback,
        autoIndex: !args.noAutoIndex,
      },
    ],
  };
}

function loadApp(args) {
  const routesJson = readRoutesJson();
  if (routesJson) {
    console.log("🎉 Serving app based on routes.json");
    return processRoutesJson(routesJson, args);
  } else {
    console.log("🎉 Serving cwd as static route");
    return buildServeCwdApp(args);
  }
}

async function main() {
  const args = parseArgv();
  const app = loadApp(args);

  await localproxy.register(app);

  if (!args.quiet) {
    console.log(app);
  }

  // Keep alive
  process.stdin.resume();

  process.on("SIGINT", async () => {
    await localproxy.deregister(app);

    process.stdin.pause();
  });
}

main().catch(console.error);
