const http = require("http");

const register = app =>
  new Promise((resolve, reject) => {
    const req = http.request("http://localhost/__proxy__/api", {
      method: "POST"
    });
    req.write(JSON.stringify(app));
    req.end();
    req.on("response", res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        reject();
      }
    });
  });

const deregister = app =>
  new Promise((resolve, reject) => {
    const req = http.request("http://localhost/__proxy__/api", {
      method: "DELETE"
    });
    req.useChunkedEncodingByDefault = true;
    req.write(JSON.stringify({ id: app.id }));
    req.end();
    req.on("response", res => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        reject();
      }
    });
  });

module.exports = {
  register,
  deregister
};
