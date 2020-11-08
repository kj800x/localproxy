const fs = require("fs");
const { getBody } = require("./util");
const mkdirp = require("mkdirp");
const execa = require("execa");
const http = require("http");
const { reload } = require("./nginx");
const util = require("util");
const rimraf = util.promisify(require("rimraf"));

async function listHosts() {
  return fs
    .readFileSync("/etc/localproxy/hosts", "utf8")
    .split("\n")
    .filter(Boolean);
}

async function addHost(hostname) {
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

async function getCert() {
  return fs.readFileSync("/etc/localproxy/ca-root/rootCA.pem", "utf8");
}

async function listTrust() {
  const files = fs.readdirSync("/etc/ssl/certs");
  const mkCerts = files.filter((file) => file.startsWith("mkcert"));
  const certSubjects = [];
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

async function trust(server) {
  return new Promise((acc, rej) => {
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
        acc();
      } catch (e) {
        rej(e);
      }
    });
  });
}

module.exports = {
  trust,
  listTrust,
  getCert,
  addHost,
  listHosts,
};
