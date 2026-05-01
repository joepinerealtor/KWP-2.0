import { readFileSync } from "node:fs";
import path from "node:path";
import { createCourseGridHtml } from "@/components/CourseCards";
import { PortalBodyState } from "@/components/PortalBodyState";
import { PortalShell } from "@/components/PortalShell";
import portalContent from "@/data/portal-content.json";
import { portalPages } from "@/lib/portal-config";

function readLegacyHtml(source) {
  const sourcePath = resolveLegacySourcePath(source);
  return readFileSync(sourcePath, "utf8");
}

function resolveLegacySourcePath(source) {
  switch (source) {
    case "index.html":
      return path.join(process.cwd(), "index.html");
    case "brand-assets.html":
      return path.join(process.cwd(), "brand-assets.html");
    case "tech/index.html":
      return path.join(process.cwd(), "tech", "index.html");
    default:
      throw new Error(`Unsupported legacy page source: ${source}`);
  }
}

function extractBodyHtml(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;

  return bodyHtml.replace(/<script\b[\s\S]*?<\/script>\s*/gi, "").trim();
}

function getLegacyPortalFragments(source) {
  const html = extractBodyHtml(readLegacyHtml(source));
  const frameOpen = html.indexOf('<div class="portal-frame">');

  if (frameOpen < 0) {
    return {
      mainHtml: html,
      overlaysHtml: ""
    };
  }

  const frameOpenEnd = html.indexOf(">", frameOpen) + 1;
  const contentOpen = html.indexOf('<div class="portal-content">', frameOpenEnd);
  const mainOpen = html.indexOf('<main class="page-content">', contentOpen);
  const mainClose = html.indexOf("</main>", mainOpen);
  const footerClose = html.indexOf("</footer>", contentOpen);
  const contentClose = html.indexOf("</div>", footerClose);
  const contentCloseEnd = contentClose + "</div>".length;
  const frameClose = html.indexOf("</div>", contentCloseEnd);
  const frameCloseEnd = frameClose + "</div>".length;
  const shellClose = html.indexOf("</div>", frameCloseEnd);
  const shellCloseEnd = shellClose + "</div>".length;

  if ([frameOpenEnd, contentOpen, mainOpen, mainClose, footerClose, contentClose, frameClose, shellClose].some((index) => index < 0)) {
    return {
      mainHtml: html,
      overlaysHtml: ""
    };
  }

  const mainOpenEnd = html.indexOf(">", mainOpen) + 1;

  return {
    mainHtml: hydrateLegacyMainHtml(source, html.slice(mainOpenEnd, mainClose).trim()),
    overlaysHtml: html.slice(shellCloseEnd).trim()
  };
}

function hydrateLegacyMainHtml(source, mainHtml) {
  if (source !== "index.html") {
    return mainHtml;
  }

  return replaceLegacyCourseGrid(mainHtml);
}

function replaceLegacyCourseGrid(mainHtml) {
  const courseGridHtml = createCourseGridHtml(portalContent.courses);
  const legacyCourseGridPattern = /(<section class="panel" id="training">[\s\S]*?)<div class="course-grid">\s*(?:<a class="course-card"[\s\S]*?<\/a>\s*)+<\/div>/;

  return mainHtml.replace(legacyCourseGridPattern, `$1${courseGridHtml}`);
}

export function LegacyPortalPage({ pageKey, source }) {
  const page = portalPages[pageKey];
  const { mainHtml, overlaysHtml } = getLegacyPortalFragments(source);

  return (
    <>
      <PortalBodyState lockLabel={page.lockLabel} />
      <PortalShell mainHtml={mainHtml} overlaysHtml={overlaysHtml} page={page} />
    </>
  );
}
