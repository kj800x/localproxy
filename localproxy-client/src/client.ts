import tmp from "tmp";
import fs from "fs";
import net from "net";
import path from "path";

tmp.setGracefulCleanup();

const LOCALPROXY_CONFIG_DIR = "/etc/localproxy/sites";
const sanitize = (s: string) => s.replace(/[^a-z0-9]/gi, "_");
let tmpFileCleanups: { [key: string]: () => void } = {};

export type RouteType = "ui" | "api" | "data";
export type LocalproxyStaticRoute = {
  static: true;
  route: string;
  staticDir: string;
  rootIndexFallback: boolean;
  dirListings: boolean;
  priority: number;
  type: RouteType;
};
export type LocalproxyDynamicRoute = {
  static: false;
  route: string;
  hostname: string;
  port: number;
  trimRoute: boolean;
  priority: number;
  type: RouteType;
};
export type LocalproxyRoute = LocalproxyStaticRoute | LocalproxyDynamicRoute;
export type LocalproxyApp = {
  id: string;
  name: string;
  pid: number;
  routes: LocalproxyRoute[];
};

export function register(app: LocalproxyApp): Promise<void> {
  return new Promise((resolve, reject) => {
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
        mode: 0o664,
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
}

export function deregister(app: LocalproxyApp) {
  const id = sanitize(app.id);
  if (tmpFileCleanups[id]) {
    tmpFileCleanups[id]();
  }
  return Promise.resolve();
}

export function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(() => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
}
