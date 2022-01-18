#!/usr/local/share/localproxy/node

import http from "http";
import WebSocket from "ws";
import os from "os";
import path from "path";

import * as store from "./store";
import { trust, getCert, addHost, listTrust, listHosts } from "./ssl";
import { getBody, PROXY_UI_BUILD_FOLDER } from "./util";
import { getVersion } from "./version";
import { AddressInfo } from "net";

store.startup();

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
  const port = (server.address() as AddressInfo).port;
  console.log(`Using http://127.0.0.1:${port} as the configuration server`);
  store.register({
    id: "localproxy system routes",
    name: "localproxy system routes",
    system: true,
    routes: [
      {
        static: true,
        route: "/__proxy__",
        staticDir: PROXY_UI_BUILD_FOLDER,
        priority: 9998,
        type: "ui",
        rootIndexFallback: false,
        dirListings: false,
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
        staticDir: PROXY_UI_BUILD_FOLDER,
        priority: -1,
        type: "ui",
        rootIndexFallback: false,
        dirListings: false,
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
        store.deregister(payload.id);
      }
      res.end();
    } else if (req.url!.includes("/version")) {
      res.write(getVersion());
      res.end();
    } else if (req.url!.includes("/ssl/trust/list")) {
      res.write(JSON.stringify(await listTrust()));
      res.end();
    } else if (req.url!.includes("/ssl/trust")) {
      const body = await getBody(req);
      const payload = JSON.parse(body);
      await trust(payload.hostname);
      res.write("OK");
      res.end();
    } else if (req.url!.includes("/ssl/hostnames/list")) {
      res.write(JSON.stringify(await listHosts()));
      res.end();
    } else if (req.url!.includes("/ssl/add-hostname")) {
      const body = await getBody(req);
      const payload = JSON.parse(body);
      await addHost(payload.hostname);
      res.write("OK");
      res.end();
    } else if (req.url!.includes("/ssl/cert")) {
      res.write(await getCert());
      res.end();
    } else if (req.url!.includes("/hostname")) {
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
