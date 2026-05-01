import { readFileSync } from "node:fs";
import path from "node:path";

function readLegacyHtml(source) {
  const sourcePath = path.join(process.cwd(), source);
  return readFileSync(sourcePath, "utf8");
}

function extractBodyHtml(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;

  return bodyHtml.replace(/<script\b[\s\S]*?<\/script>\s*/gi, "").trim();
}

export function LegacyPage({ source }) {
  const html = extractBodyHtml(readLegacyHtml(source));

  return <div data-legacy-page dangerouslySetInnerHTML={{ __html: html }} />;
}
