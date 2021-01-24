const tmp = require("tmp");
const fs = require("fs");
const net = require("net");
const path = require("path");

tmp.setGracefulCleanup();

const LOCALPROXY_CONFIG_DIR = "/etc/localproxy/sites";
const sanitize = (s) => s.replace(/[^a-z0-9]/gi, "_");
let tmpFileCleanups = {};

const register = (app) =>
  new Promise((resolve, reject) => {
    const id = sanitize(app.id);
    const filename = `${id}.json`;
    const contents = JSON.stringify(app);
    const fullPath = path.join(LOCALPROXY_CONFIG_DIR, filename);
    if (fs.existsSync(fullPath)) {
      console.warn("⚠️  We had to clean up an existing localproxy file!");
      fs.unlinkSync(fullPath);
    }
    tmp.file(
      {
        mode: 0664,
        discardDescriptor: true,
        dir: LOCALPROXY_CONFIG_DIR,
        name: filename,
      },
      (err, name, _fd, cleanup) => {
        if (err) {
          console.error(
            "Failed to create localproxy file, are you a member of localproxyusers?"
          );
          reject(err);
          return;
        }
        fs.writeFile(name, contents, (err) => {
          if (err) {
            console.error(
              "Failed to write localproxy file, are you a member of localproxyusers?"
            );
            reject(err);
            return;
          }
          tmpFileCleanups[id] = cleanup;
          resolve();
        });
      }
    );
  });

const deregister = (app) => {
  const id = sanitize(app.id);
  if (tmpFileCleanups[id]) {
    tmpFileCleanups[id]();
  }
  return Promise.resolve();
};

const getAvailablePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(() => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });

module.exports = {
  register,
  deregister,
  getAvailablePort,
};
