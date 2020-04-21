const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const nginx = require("./nginx");

const WATCH_DIR = "/etc/localproxy";

let apps = {};
let onSyncHandler = () => {};

const sanitize = (s) => s.replace(/[^a-z0-9]/gi, "_");

const forceSync = () => {
  const files = fs.readdirSync(WATCH_DIR);
  apps = {};
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    var contents = fs.readFileSync(path.join(WATCH_DIR, file), "utf8");
    try {
      const app = JSON.parse(contents);
      apps[app["id"]] = app;
    } catch (e) {}
  }
  onSyncHandler(getApps());
  nginx.sync(getApps());
};

const startup = () => {
  return new Promise((resolve, reject) => {
    rimraf(path.join(WATCH_DIR, "*"), (err) => {
      if (err) {
        reject(err);
        return;
      }
      fs.watch(WATCH_DIR, forceSync);
      resolve();
    });
  });
};

const getApps = () => Object.values(apps);

function register(payload) {
  const file = `${sanitize(payload.id)}.json`;
  fs.writeFileSync(path.join(WATCH_DIR, file), JSON.stringify(payload));
  forceSync();
}

function deRegister(id) {
  const file = `${sanitize(id)}.json`;
  if (fs.existsSync(path.join(WATCH_DIR, file))) {
    fs.unlinkSync(path.join(WATCH_DIR, file));
  }
  forceSync();
}

module.exports = {
  startup,
  forceSync,
  register,
  deRegister,
  getApps,
  onSync: (fn) => (onSyncHandler = fn),
};
