const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const nginx = require("./nginx");
const psList = require("ps-list");

const WATCH_DIR = "/etc/localproxy/sites";

let apps = {};
let onSyncHandler = () => {};

const sanitize = (s) => s.replace(/[^a-z0-9-]/gi, "-");

const forceSync = () => {
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

const startup = () => {
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

const getApps = () => Object.values(apps);

function register(payload) {
  const file = `${sanitize(payload.id)}.json`;
  fs.writeFileSync(path.join(WATCH_DIR, file), JSON.stringify(payload));
  fs.chmodSync(path.join(WATCH_DIR, file), "0664");
  forceSync();
}

function deregister(id) {
  const file = `${sanitize(id)}.json`;
  if (fs.existsSync(path.join(WATCH_DIR, file))) {
    fs.unlinkSync(path.join(WATCH_DIR, file));
  } else {
    console.warn(`Unable to deregister ${id}, does a ${file} file exist?`);
  }
  forceSync();
}

const isProcessRunning = (pid, listOfPs) => {
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

module.exports = {
  startup,
  forceSync,
  register,
  deregister,
  getApps,
  onSync: (fn) => (onSyncHandler = fn),
};
