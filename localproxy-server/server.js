#!/usr/local/share/localproxy/node

const http = require("http");
const WebSocket = require("ws");
const os = require("os");

const store = require("./store");
const { trust, getCert, addHost, listTrust, listHosts } = require("./ssl");
const { getBody } = require("./util");

store.startup().then(() => {
  const server = http.createServer().listen(0, "127.0.0.1");
  const wss = new WebSocket.Server({ server });

  store.onSync((apps) => {
    [...wss.clients]
      .filter((client) => client.readyState === WebSocket.OPEN)
      .forEach((client) => {
        client.send(JSON.stringify(apps));
      });
  });

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
          type: "ui",
        },
        {
          static: false,
          route: "/__proxy__/api",
          hostname: "127.0.0.1",
          port: port,
          trimRoute: true,
          priority: 9999,
          type: "api",
        },
        {
          static: true,
          route: "/",
          staticDir: __dirname + "/proxy-ui/build/",
          priority: -1,
          type: "ui",
        },
      ],
    });
  });

  server.on("request", async (req, res) => {
    try {
      if (req.url === "/") {
        if (req.method === "GET") {
          res.write(JSON.stringify(store.getApps()));
        } else if (req.method === "POST") {
          const body = await getBody(req);
          const payload = JSON.parse(body);
          console.info(`Adding ${payload.id} based on endpoint request`);
          store.register(payload);
        } else if (req.method === "DELETE") {
          const body = await getBody(req);
          const payload = JSON.parse(body);
          console.info(`Removing ${payload.id} based on endpoint request`);
          store.deRegister(payload.id);
        }
        res.end();
      } else if (req.url.includes("/ssl/trust/list")) {
        res.write(JSON.stringify(await listTrust()));
        res.end();
      } else if (req.url.includes("/ssl/trust")) {
        const body = await getBody(req);
        const payload = JSON.parse(body);
        await trust(payload.hostname);
        res.write("OK");
        res.end();
      } else if (req.url.includes("/ssl/hostnames/list")) {
        res.write(JSON.stringify(await listHosts()));
        res.end();
      } else if (req.url.includes("/ssl/add-hostname")) {
        const body = await getBody(req);
        const payload = JSON.parse(body);
        await addHost(payload.hostname);
        res.write("OK");
        res.end();
      } else if (req.url.includes("/ssl/cert")) {
        res.write(await getCert());
        res.end();
      } else if (req.url.includes("/hostname")) {
        res.write(os.hostname());
        res.end();
      } else {
        res.write("Unhandled Request");
        res.end();
      }
    } catch (e) {
      console.error(e);
    }
  });
});
