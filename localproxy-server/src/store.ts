import fs from "fs";
import path from "path";
import * as nginx from "./nginx";
import psList, { ProcessDescriptor } from "ps-list";
import { sanitize } from "./util";
import { LocalproxyApp } from "./types";

const WATCH_DIR = "/etc/localproxy/sites";

let apps: { [id: string]: LocalproxyApp } = {};
let onSyncHandler: (apps: LocalproxyApp[]) => void = () => {};

export const forceSync = () => {
  const files = fs.readdirSync(WATCH_DIR);
  apps = {};
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const contents = fs.readFileSync(path.join(WATCH_DIR, file), "utf8");
    try {
      const app = JSON.parse(contents);
      apps[app["id"]] = app;
    } catch (e) {}
  }
  onSyncHandler(getApps());
  nginx.sync(getApps());
};

export const startup = () => {
  const files = fs.readdirSync(WATCH_DIR);
  for (const file of files) {
    try {
      if (file.endsWith(".json")) {
        const contents = JSON.parse(
          fs.readFileSync(path.join(WATCH_DIR, file), "utf8")
        );
        if (contents.persist) {
          continue;
        }
      }
    } catch (e) {
      console.error("Error during startup", e);
    }
    fs.unlinkSync(path.join(WATCH_DIR, file));
  }

  fs.watch(WATCH_DIR, forceSync);
};

export function getApps() {
  return Object.values(apps);
}

export function register(payload: LocalproxyApp) {
  const file = `${sanitize(payload.id)}.json`;
  fs.writeFileSync(path.join(WATCH_DIR, file), JSON.stringify(payload));
  fs.chmodSync(path.join(WATCH_DIR, file), "0664");
  forceSync();
}

export function deregister(id: string) {
  const file = `${sanitize(id)}.json`;
  if (fs.existsSync(path.join(WATCH_DIR, file))) {
    fs.unlinkSync(path.join(WATCH_DIR, file));
  } else {
    console.warn(`Unable to deregister ${id}, does a ${file} file exist?`);
  }
  forceSync();
}

const isProcessRunning = (pid: number, listOfPs: ProcessDescriptor[]) => {
  return !!listOfPs.find((ps) => ps.pid === pid);
};

const pruneDeadApps = async () => {
  const apps = getApps();
  const listOfPs = await psList();
  for (let app of apps) {
    if (app.pid && app.pid !== -1 && !isProcessRunning(app.pid, listOfPs)) {
      console.info(`Pruning ${app.id} based on dead pid: ${app.pid}`);
      deregister(app.id);
    }
  }
};

setInterval(pruneDeadApps, 1000);

export function onSync(fn: (apps: LocalproxyApp[]) => void) {
  return (onSyncHandler = fn);
}

module.exports = {
  startup,
  forceSync,
  register,
  deregister,
  getApps,
  onSync,
};
