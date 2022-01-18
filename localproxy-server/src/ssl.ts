import fs from "fs";
import { getBody } from "./util";
import mkdirp from "mkdirp";
import execa from "execa";
import http from "http";
import { reload } from "./nginx";
import util from "util";
const rimraf = util.promisify(require("rimraf"));

export async function listHosts() {
  return fs
    .readFileSync("/etc/localproxy/hosts", "utf8")
    .split("\n")
    .filter(Boolean);
}

export async function addHost(hostname: string) {
  const hosts = fs
    .readFileSync("/etc/localproxy/hosts", "utf8")
    .split("\n")
    .filter(Boolean);

  hosts.push(hostname);

  fs.writeFileSync("/etc/localproxy/hosts", hosts.join("\n") + "\n");

  await execa(
    "/usr/local/share/localproxy/mkcert",
    [
      "-cert-file",
      "/etc/localproxy/localproxy.pem",
      "-key-file",
      "/etc/localproxy/localproxy-key.pem",
      ...hosts,
    ],
    {
      env: { CAROOT: "/etc/localproxy/ca-root" },
    }
  );

  reload();
}

export async function getCert() {
  return fs.readFileSync("/etc/localproxy/ca-root/rootCA.pem", "utf8");
}

export async function listTrust() {
  const files = fs.readdirSync("/etc/ssl/certs");
  const mkCerts = files.filter((file) => file.startsWith("mkcert"));
  const certSubjects: string[] = [];
  for (const cert of mkCerts) {
    const { stdout } = await execa("openssl", [
      "x509",
      "-issuer",
      "-noout",
      "-in",
      `/etc/ssl/certs/${cert}`,
    ]);
    certSubjects.push(stdout);
  }
  return certSubjects;
}

export async function trust(server: string) {
  return new Promise<void>((resolve, reject) => {
    http.get(`http://${server}/__proxy__/api/ssl/cert`, async (res) => {
      try {
        const cert = await getBody(res);
        await mkdirp("/tmp/remote-cert-install");
        fs.writeFileSync("/tmp/remote-cert-install/rootCA.pem", cert);
        await execa("sudo", [
          "CAROOT=/tmp/remote-cert-install",
          "/usr/bin/mkcert-install",
        ]);
        await rimraf("/tmp/remote-cert-install");
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}
