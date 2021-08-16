const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join("/", "etc", "localproxy", "config.json");

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

module.exports = {
  readConfig,
};
