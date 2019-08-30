#!/usr/bin/env node

const path = require("path");
const process = require("process");

const localproxy = require("./client");

const CWD = process.cwd();

function parseArgv() {
  const flag = x => process.argv.includes(x);
  const namedArg = x =>
    process.argv.includes(x) ? process.argv[process.argv.indexOf(x) + 1] : null;

  return {
    background: flag("-b"),
    deregister: flag("-d"),
    verbose: flag("-v"),
    route: namedArg("--route"),
    id: namedArg("--index"),
    name: namedArg("--name"),
    priority: namedArg("--priority"),
    indexFallback: flag("--index-fallback"),
    autoIndex: flag("--auto-index")
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
    routes: routesJson.routes.map(route => ({
      ...route,
      priority: args.priority
        ? parseInt(args.priority, 10)
        : route.priority || 0,
      staticDir: route.staticDir
        ? path.resolve(CWD, route.staticDir) + "/"
        : undefined
    }))
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
        indexFallback: args.indexFallback || false,
        autoIndex: args.autoIndex || false
      }
    ]
  };
}

function loadApp(args) {
  const routesJson = readRoutesJson();
  if (routesJson) {
    console.log("using routes.json");
    return processRoutesJson(routesJson, args);
  }
  console.log("serving cwd as static route");
  return buildServeCwdApp(args);
}

function main() {
  const args = parseArgv();
  const app = loadApp(args);

  if (args.verbose) {
    console.log(app);
  }

  if (args.deregister) {
    localproxy.deregister(app);
    return;
  }
  localproxy.register(app);

  if (args.background) {
    return;
  }
  // Keep alive
  process.stdin.resume();

  process.on("SIGINT", () => {
    localproxy.deregister(app);

    process.stdin.pause();
  });
}

main();
