const nginx = require("./nginx");

const apps = {};

function getRoutes() {
  return Object.values(apps)
    .map(app => app.routes)
    .flat();
}

function getApps() {
  return Object.values(apps);
}

function register(payload) {
  apps[payload.id] = payload;
  nginx.sync(getRoutes());
}

function deRegister(id) {
  delete apps[id];
  nginx.sync(getRoutes());
}

module.exports = {
  register,
  deRegister,
  getRoutes,
  getApps
};
