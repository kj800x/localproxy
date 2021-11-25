const fs = require("fs");

let cachedVersion;

function getVersion() {
  if (!cachedVersion) {
    if (fs.existsSync("./version.txt")) {
      cachedVersion = fs.readFileSync("./version.txt", "utf8");
    } else {
      cachedVersion = "dev";
    }
  }
  return cachedVersion;
}

module.exports = {
  getVersion,
};
