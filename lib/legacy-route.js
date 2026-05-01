import { readFileSync } from "node:fs";
import path from "node:path";

export function legacyHtmlResponse(source) {
  const sourcePath = resolveLegacyRoutePath(source);
  const html = readFileSync(sourcePath, "utf8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

function resolveLegacyRoutePath(source) {
  switch (source) {
    case "login-screen-preview.html":
      return path.join(process.cwd(), "login-screen-preview.html");
    case "_drafts/lone-wolf-transition-hub.html":
      return path.join(process.cwd(), "_drafts", "lone-wolf-transition-hub.html");
    default:
      throw new Error(`Unsupported legacy route source: ${source}`);
  }
}
