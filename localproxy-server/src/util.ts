import { IncomingMessage } from "http";
import path from "path";

export function getBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const body: Buffer[] = [];
    req.on("error", reject);
    req.on("data", (chunk: Buffer) => body.push(chunk));
    req.on("end", () => resolve(Buffer.concat(body).toString()));
  });
}

export function sanitize(s: string) {
  return s.replace(/[^a-z0-9-]/gi, "-");
}

export const PROXY_UI_BUILD_FOLDER =
  path.resolve(__dirname, "..", "proxy-ui", "build") + "/";
