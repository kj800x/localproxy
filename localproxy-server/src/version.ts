import fs from "fs";
import path from "path";

const VERSION_FILE = path.join(__dirname, "..", "version.txt");
let cachedVersion: string;

export function getVersion() {
  if (!cachedVersion) {
    if (fs.existsSync(VERSION_FILE)) {
      cachedVersion = fs.readFileSync(VERSION_FILE, "utf8");
    } else {
      cachedVersion = "dev";
    }
  }
  return cachedVersion;
}
