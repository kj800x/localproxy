#!/usr/local/share/localproxy/node

const http = require("http");

const store = require("./store");

const getBody = (req) =>
  new Promise((acc, rej) => {
    body = [];
    req
      .on("error", (err) => {
        rej(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        acc(body);
      });
  });

store.startup().then(() => {
  const server = http.createServer().listen(0, "localhost");

  server.on("listening", () => {
    const port = server.address().port;
    console.log(`Using ${port}`);
    store.register({
      id: "localproxy system routes",
      name: "localproxy system routes",
      system: true,
      routes: [
        {
          static: true,
          route: "/__proxy__",
          staticDir: __dirname + "/proxy-ui/build/",
          priority: 9998,
        },
        {
          static: false,
          route: "/__proxy__/api",
          hostname: "localhost",
          port: port,
          trimRoute: true,
          priority: 9999,
        },
        {
          static: true,
          route: "/",
          staticDir: __dirname + "/proxy-ui/build/",
          priority: -1,
        },
      ],
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
});
