const fs = require("fs");
const { getBody } = require("./util");
const mkdirp = require("mkdirp");
const execa = require("execa");
const http = require("http");
const { reload } = require("./nginx");

async function addHost(hostname) {
  const hosts = fs
    .readFileSync("/etc/localproxy-hosts", "utf8")
    .split("\n")
    .filter(Boolean);
  hosts.push(hostname);
  fs.writeFileSync("/etc/localproxy-hosts", hosts.join("\n") + "\n");

  await execa(
    "/usr/local/share/localproxy/mkcert",
    [
      "-cert-file",
      "/usr/local/share/localproxy/localproxy.pem",
      "-key-file",
      "/usr/local/share/localproxy/localproxy-key.pem",
      ...hosts,
    ],
    {
      env: { CAROOT: "/usr/local/share/localproxy/ca-root" },
    }
  );

  reload();
}

async function getCert() {
  return fs.readFileSync(
    "/usr/local/share/localproxy/ca-root/rootCA.pem",
    "utf8"
  );
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
        acc();
      } catch (e) {
        rej(e);
      }
    });
  });
}

module.exports = {
  trust,
  getCert,
  addHost,
};
