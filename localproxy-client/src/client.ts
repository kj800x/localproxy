import tmp from "tmp";
import fs from "fs";
import path from "path";

import { StandaloneServer } from "./standalone-server";
import { LocalproxyApp } from "./types";
import {
  useStandalone,
  sanitize,
  LOCALPROXY_CONFIG_DIR,
  groupWarning,
  getFile,
  getAvailablePortFromList,
} from "./util";

export {
  RouteType,
  LocalproxyApp,
  LocalproxyRoute,
  LocalproxyDynamicRoute,
  LocalproxyStaticRoute,
} from "./types";
export { getAvailablePort } from "./util";

tmp.setGracefulCleanup();
let tmpFileCleanups: { [key: string]: () => void } = {};
let standalone: StandaloneServer | null = null;

export async function register(app: LocalproxyApp): Promise<void> {
  if (!useStandalone()) {
    if (!standalone) {
      standalone = new StandaloneServer(
        await getAvailablePortFromList([80, 8080])
      );
    }
    standalone.register(app);
    return;
  }

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
  if (standalone) {
    standalone.deregister(app);
    return;
  }

  const id = sanitize(app.id);
  const filename = `${id}.json`;
  const fullPath = path.join(LOCALPROXY_CONFIG_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn(
      "⚠️  We tried to clean up a localproxy file but it didn't exist!"
    );
  }
  if (tmpFileCleanups[id]) {
    tmpFileCleanups[id]();
  }
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
