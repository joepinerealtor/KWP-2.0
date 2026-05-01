import { readFileSync } from "node:fs";
import path from "node:path";

export function legacyHtmlResponse(source) {
  const sourcePath = path.join(process.cwd(), source);
  const html = readFileSync(sourcePath, "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
