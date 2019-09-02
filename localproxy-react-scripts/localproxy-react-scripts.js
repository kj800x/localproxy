const localproxy = require("@kj800x/localproxy-client");
const net = require("net");
const reactScriptsBin = require.resolve(".bin/react-scripts");
const execa = require("execa");

// Allocate a port
const getAvailablePort = options =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(options, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });

async function main() {
  const port = await getAvailablePort();

  const localproxyApp = {
    id: "alldex-client-dev",
    name: "Alldex Client Dev",
    routes: [
      {
        static: false,
        route: "/",
        hostname: "localhost",
        port,
        trimRoute: false,
        priority: 1
      }
    ]
  };

  localproxy.register(localproxyApp);

  let child;
  try {
    child = execa(reactScriptsBin, ["start"], {
      env: { PORT: port, BROWSER: "none" },
      stdio: "inherit",
      reject: false
    });
  } catch (e) {}

  process.on("SIGINT", () => {
    localproxy.deregister(localproxyApp);
  });

  await child;
}

main().catch(console.error);
