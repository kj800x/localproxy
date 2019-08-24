#!/usr/local/share/localproxy/node

const http = require("http");

const store = require("./store");

const getBody = req =>
  new Promise((acc, rej) => {
    body = [];
    req
      .on("error", err => {
        rej(err);
      })
      .on("data", chunk => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        acc(body);
      });
  });

const server = http.createServer().listen(0);

server.on("listening", () => {
  const port = server.address().port;
  console.log(`Using ${port}`);
  store.register({
    id: "localproxy system routes",
    name: "localproxy system routes",
    system: true,
    routes: [
      {
        static: false,
        route: "/__proxy__/api",
        hostname: "localhost",
        port: port,
        trimRoute: true
      },
      {
        static: true,
        route: "/__proxy__",
        staticDir: __dirname + "/proxy-ui/build/"
      },
      {
        static: true,
        fallback: true,
        route: "/",
        staticDir: __dirname + "/proxy-ui/build/"
      }
    ]
  });
});

server.on("request", async (req, res) => {
  if (req.url === "/") {
    if (req.method === "GET") {
      res.write(JSON.stringify(store.getApps()));
    } else if (req.method === "POST") {
      const body = await getBody(req);
      const payload = JSON.parse(body);
      store.register(payload);
    } else if (req.method === "DELETE") {
      const body = await getBody(req);
      const payload = JSON.parse(body);
      store.deRegister(payload.id);
    }
    res.end();
  }
});
