import { readFileSync } from "node:fs";
import path from "node:path";
import { createAssetGridHtml, createMarketingToolGridHtml, createSourceFileGridHtml } from "@/components/AssetCards";
import { createCourseGridHtml } from "@/components/CourseCards";
import { createAlcPosterGridHtml, createLeadershipGridHtml } from "@/components/LeadershipCards";
import { createOfficeGridHtml, createRoomBookingCardHtml } from "@/components/OfficeCards";
import { PortalBodyState } from "@/components/PortalBodyState";
import { PortalShell } from "@/components/PortalShell";
import { createVendorGridHtml } from "@/components/VendorCards";
import portalContent from "@/data/portal-content.json";
import { escapeHtml } from "@/lib/portal-html";
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
  if (source === "index.html") {
    return replaceLegacyCourseGrid(replaceLegacyTrainingResourceGrid(replaceLegacyVendorGrids(replaceLegacyLeadershipGrids(replaceLegacyOfficeCards(mainHtml)))));
  }

  if (source === "brand-assets.html") {
    return replaceLegacyBrandAssetGrids(mainHtml);
  }

  return mainHtml;
}

function replaceLegacyTrainingResourceGrid(mainHtml) {
  const trainingResourceSection = portalContent.sections?.trainingResources || {
    eyebrow: "Self-Paced Support",
    title: "Training Resources"
  };
  const trainingResourcesGridHtml = createCourseGridHtml(portalContent.trainingResources, {
    editableType: "training-resource-card"
  });
  const legacyTrainingHeadPattern = /(<section class="panel" id="training-resources">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyTrainingGridPattern = /(<section class="panel" id="training-resources">[\s\S]*?)<div class="course-grid">\s*(?:<a class="course-card"[\s\S]*?<\/a>\s*)+<\/div>/;
  const trainingResourceHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="trainingResources">${escapeHtml(trainingResourceSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="trainingResources">${escapeHtml(trainingResourceSection.title)}</h2>`;

  return mainHtml
    .replace(legacyTrainingHeadPattern, `$1${trainingResourceHeadHtml}`)
    .replace(legacyTrainingGridPattern, `$1${trainingResourcesGridHtml}`);
}

function replaceLegacyCourseGrid(mainHtml) {
  const courseGridHtml = createCourseGridHtml(portalContent.courses);
  const legacyCourseGridPattern = /(<section class="panel" id="training">[\s\S]*?)<div class="course-grid">\s*(?:<a class="course-card"[\s\S]*?<\/a>\s*)+<\/div>/;

  return mainHtml.replace(legacyCourseGridPattern, `$1${courseGridHtml}`);
}

function replaceLegacyVendorGrids(mainHtml) {
  return mainHtml
    .replace(
      '<div class="vendor-grid vendor-grid-featured" data-vendor-grid="core" aria-live="polite"></div>',
      createVendorGridHtml(portalContent.vendors, "core", { featured: true })
    )
    .replace(
      '<div class="vendor-grid" data-vendor-grid="services" aria-live="polite"></div>',
      createVendorGridHtml(portalContent.vendors, "services")
    );
}

function replaceLegacyLeadershipGrids(mainHtml) {
  const leadershipSection = portalContent.sections?.leadership || {
    eyebrow: "Leadership Directory",
    title: "Office leadership team"
  };
  const alcSection = portalContent.sections?.alc || {
    eyebrow: "Associate Leadership Council",
    title: "2026 ALC Board of Directors",
    summary: "Poster set for the ALC board members and committees posted throughout the brokerage."
  };
  const legacyLeadershipHeadPattern = /(<section class="panel" id="leadership">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyAlcHeadPattern = /(<article class="alc-card" id="alc-board">\s*<div class="alc-card-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h3>[\s\S]*?<\/h3>\s*<p class="alc-card-summary">[\s\S]*?<\/p>/;
  const leadershipHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="leadership">${escapeHtml(leadershipSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="leadership">${escapeHtml(leadershipSection.title)}</h2>`;
  const alcHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="alc">${escapeHtml(alcSection.eyebrow)}</p><h3 data-editable-type="section-heading" data-editable-id="alc">${escapeHtml(alcSection.title)}</h3><p class="alc-card-summary" data-editable-type="section-summary" data-editable-id="alc">${escapeHtml(alcSection.summary)}</p>`;

  return mainHtml
    .replace(legacyLeadershipHeadPattern, `$1${leadershipHeadHtml}`)
    .replace(legacyAlcHeadPattern, `$1${alcHeadHtml}`)
    .replace(
      '<div class="leadership-grid" data-leadership-grid aria-live="polite"></div>',
      createLeadershipGridHtml(portalContent.leadership)
    )
    .replace(
      '<div class="alc-poster-grid" data-alc-grid aria-label="2026 ALC poster set" aria-live="polite"></div>',
      createAlcPosterGridHtml(portalContent.leadership)
    );
}

function replaceLegacyBrandAssetGrids(mainHtml) {
  return mainHtml
    .replace(
      /<div class="marketing-tool-grid">\s*(?:<article class="asset-source-card marketing-tool-card">[\s\S]*?<\/article>\s*)+<\/div>/,
      createMarketingToolGridHtml(portalContent.brandAssets.marketingTools)
    )
    .replace(
      /<div class="asset-grid">\s*(?:<article class="asset-card">[\s\S]*?<\/article>\s*)+<\/div>/,
      createAssetGridHtml(portalContent.brandAssets.digitalLogos)
    )
    .replace(
      /<div class="asset-source-grid">\s*(?:<article class="asset-source-card">[\s\S]*?<\/article>\s*)+<\/div>/,
      createSourceFileGridHtml(portalContent.brandAssets.sourceFiles)
    );
}

function replaceLegacyOfficeCards(mainHtml) {
  const officeSection = portalContent.sections?.office || {
    eyebrow: "Office Hub",
    title: "Resources, office information, and internal support"
  };
  const roomsSection = portalContent.sections?.rooms || {
    eyebrow: "Conference + Training Rooms",
    title: "Book a room and review current reservations"
  };
  const legacyOfficeHeadPattern = /(<section class="panel" id="office">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyRoomsHeadPattern = /(<section class="panel" id="conference-rooms">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const officeHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="office">${escapeHtml(officeSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="office">${escapeHtml(officeSection.title)}</h2>`;
  const roomsHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="rooms">${escapeHtml(roomsSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="rooms">${escapeHtml(roomsSection.title)}</h2>`;

  return mainHtml
    .replace(legacyOfficeHeadPattern, `$1${officeHeadHtml}`)
    .replace(legacyRoomsHeadPattern, `$1${roomsHeadHtml}`)
    .replace(
      /<div class="office-grid">\s*(?:<article class="office-card(?: [^"]+)?">[\s\S]*?<\/article>\s*)+<\/div>/,
      createOfficeGridHtml(portalContent.office)
    )
    .replace(
      /<article class="office-card office-booking-card">[\s\S]*?<\/article>/,
      createRoomBookingCardHtml(portalContent.office.rooms)
    );
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
