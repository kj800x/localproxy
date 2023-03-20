import http, { IncomingMessage, ServerResponse } from "http";
import fs, { createReadStream } from "fs";
import { URL } from "url";
import path from "path";

import { LocalproxyApp, LocalproxyRoute } from "./types";

export class StandaloneServer {
  apps: LocalproxyApp[] = [];
  routes: LocalproxyRoute[] = [];

  constructor(port: number) {
    this.handle = this.handle.bind(this);
    this.requestListener = this.requestListener.bind(this);
    this.regenerateRoutes = this.regenerateRoutes.bind(this);
    this.register = this.register.bind(this);
    this.deregister = this.deregister.bind(this);

    console.warn(
      "⚠️  Creating localproxy standalone server. Consider installing the OS installed localproxy server instead"
    );
    const server = http.createServer(this.requestListener);
    server.listen(port, "localhost", () => {
      console.log(`Standalone server is running on http://localhost:${port}`);
    });
  }

  handle(req: IncomingMessage, res: ServerResponse, route: LocalproxyRoute) {
    if (route.static) {
      const url = new URL(req.url!, "http://localhost:80/");
      url.pathname = url.pathname.substring(route.route.length);
      const filePath = path.resolve(route.staticDir, url.pathname.substring(1));
      const rootPath = path.resolve(route.staticDir, "index.html");
      let file: fs.ReadStream | null = null;
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (fs.existsSync(path.join(filePath, "index.html"))) {
            file = createReadStream(path.join(filePath, "index.html"));
          }
        } else {
          file = createReadStream(filePath);
        }
      }

      if (file == null && route.rootIndexFallback && fs.existsSync(rootPath)) {
        file = createReadStream(rootPath);
      }

      if (file) {
        file.pipe(res);
      } else {
        res.writeHead(404);
        res.end("File not found");
        return;
      }
    } else {
      const url = new URL(req.url!, "http://localhost:80/");
      url.port = `${route.port}`;
      url.hostname = route.hostname;
      if (route.trimRoute) {
        url.pathname = url.pathname.substring(route.route.length);
      }
      const proxy_req = http.request(url, {
        method: req.method,
        headers: req.headers,
      });
      proxy_req.addListener("response", (proxy_res) => {
        proxy_res.addListener("data", (chunk) => res.write(chunk, "binary"));
        proxy_res.addListener("end", () => res.end());
        res.writeHead(proxy_res.statusCode!, proxy_res.headers);
      });
      req.addListener("data", (chunk) => proxy_req.write(chunk, "binary"));
      req.addListener("end", () => proxy_req.end());
    }
  }

  requestListener(req: IncomingMessage, res: ServerResponse) {
    for (const route of this.routes) {
      if (req.url!.startsWith(route.route)) {
        this.handle(req, res, route);
        return;
      }
    }
    res.writeHead(404);
    res.end("Route not registered");
  }

  regenerateRoutes() {
    this.routes = this.apps.flatMap((app) => app.routes);
    this.routes.sort((routeA, routeB) => routeB.priority - routeA.priority);
  }

  register(app: LocalproxyApp) {
    this.apps.push(app);
    this.regenerateRoutes();
  }

  deregister(app: LocalproxyApp) {
    this.apps = this.apps.filter((a) => a.id !== app.id);
    this.regenerateRoutes();
  }
}
