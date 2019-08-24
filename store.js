const nginx = require("./nginx");

const apps = {};

function getApps() {
  return Object.values(apps);
}

function register(payload) {
  apps[payload.id] = payload;
  nginx.sync(getApps());
}

function deRegister(id) {
  delete apps[id];
  nginx.sync(getApps());
}

module.exports = {
  register,
  deRegister,
  getApps
};
