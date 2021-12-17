import tmp from "tmp";
import fs from "fs";
import net from "net";
import path from "path";

tmp.setGracefulCleanup();

const LOCALPROXY_CONFIG_DIR = "/etc/localproxy/sites";
const sanitize = (s: string) => s.replace(/[^a-z0-9-]/gi, "-");
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
  pid?: number;
  persist?: true;
  routes: LocalproxyRoute[];
};

function groupWarning(message: string) {
  console.error(`⛔ ${message},\n   are you a member of localproxyusers?`);
  console.error(
    `💡 Try running "sudo usermod -a -G localproxyusers $USER"\n   and then restarting your login session.`
  );
  console.log("");
}

async function getFile(
  filename: string,
  persist: boolean = false
): Promise<{
  filePath: string;
  cleanup: () => void;
}> {
  return new Promise((resolve, reject) => {
    tmp.file(
      {
        mode: 0o664,
        discardDescriptor: true,
        dir: LOCALPROXY_CONFIG_DIR,
        name: filename,
        keep: persist,
      },
      (err, name, _fd, cleanup) => {
        if (err) {
          return reject(err);
        }
        resolve({ filePath: name, cleanup });
      }
    );
  });
}

export async function register(app: LocalproxyApp): Promise<void> {
  const id = sanitize(app.id);
  const filename = `${id}.json`;
  const fullPath = path.join(LOCALPROXY_CONFIG_DIR, filename);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.warn("⚠️  We had to clean up an existing localproxy file!");
    }
  } catch (err) {
    groupWarning("Failed to clean up an existing localproxy file");
    throw err;
  }

  if (app.persist) {
    app = { ...app };
    delete app.pid;
  }
  const contents = JSON.stringify(app);

  try {
    const { filePath, cleanup } = await getFile(filename, app.persist);
    fs.writeFileSync(filePath, contents);
    tmpFileCleanups[id] = cleanup;
  } catch (err) {
    groupWarning("Failed to write localproxy file");
    throw err;
  }
}

export function deregister(app: LocalproxyApp): void {
  const id = sanitize(app.id);
  if (tmpFileCleanups[id]) {
    tmpFileCleanups[id]();
  }
  const filename = `${id}.json`;
  const fullPath = path.join(LOCALPROXY_CONFIG_DIR, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
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
