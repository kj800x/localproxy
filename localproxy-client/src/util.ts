import tmp from "tmp";
import fs from "fs";
import net from "net";

export const LOCALPROXY_CONFIG_DIR = "/etc/localproxy/sites";
export const sanitize = (s: string) => s.replace(/[^a-z0-9-]/gi, "-");

export function useStandalone(): boolean {
  return (
    !fs.existsSync(LOCALPROXY_CONFIG_DIR) ||
    "LOCALPROXY_FORCE_STANDALONE" in process.env
  );
}

export function groupWarning(message: string) {
  console.error(`⛔ ${message},\n   are you a member of localproxyusers?`);
  console.error(
    `💡 Try running "sudo usermod -a -G localproxyusers $USER"\n   and then restarting your login session.`
  );
  console.log("");
}

export async function getFile(
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

export function portIsAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var server = net.createServer();
    server.unref();
    server.on("error", function (err: NodeJS.ErrnoException) {
      if (err.code === "EADDRINUSE" || err.code === "EACCES") {
        resolve(false);
      } else {
        console.log(err);
      }
      server.close(() => {});
    });
    server.on("listening", function () {
      server.close(() => {
        resolve(true);
      });
    });
    server.listen(port);
  });
}

export async function getAvailablePortFromList(
  ports: number[]
): Promise<number> {
  for (const port of ports) {
    if (await portIsAvailable(port)) {
      return port;
    }
  }
  throw new Error("All ports were unavailable");
}
