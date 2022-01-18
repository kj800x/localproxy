import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join("/", "etc", "localproxy", "config.json");

export type LocalproxyConfig =
  | {
      ssl?: "enabled" | "disabled";
    }
  | {
      ssl: "custom";
      sslCert: string;
      sslCertKey: string;
    };

export function readConfig(): LocalproxyConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}
