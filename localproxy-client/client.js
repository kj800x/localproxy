const http = require("http");

const register = app => {
  const req = http.request("http://localhost/__proxy__/api", {
    method: "POST"
  });
  req.write(JSON.stringify(app));
  req.end();
};

const deregister = app => {
  const req = http.request("http://localhost/__proxy__/api", {
    method: "DELETE"
  });
  req.useChunkedEncodingByDefault = true;
  req.write(JSON.stringify({ id: app.id }));
  req.end();
};

module.exports = {
  register,
  deregister
};
