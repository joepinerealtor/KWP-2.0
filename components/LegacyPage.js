import { readFileSync } from "node:fs";
import path from "node:path";
import { createAssetGridHtml, createMarketingToolGridHtml, createSourceFileGridHtml } from "@/components/AssetCards";
import { createCourseGridHtml } from "@/components/CourseCards";
import { createCustomSectionsHtml } from "@/components/CustomSections";
import { createAlcPosterGridHtml, createLeadershipGridHtml } from "@/components/LeadershipCards";
import { createOfficeGridHtml, createRoomBookingCardHtml } from "@/components/OfficeCards";
import { PortalBodyState } from "@/components/PortalBodyState";
import { PortalShell } from "@/components/PortalShell";
import { createTechCardGridHtml, createTechJoeSupportHtml, createTechQuickLinksHtml } from "@/components/TechConnectCards";
import { createVendorGridHtml } from "@/components/VendorCards";
import portalContent from "@/data/portal-content.json";
import { getTechConnectContent } from "@/lib/tech-connect-content";
import { escapeHtml, escapeHtmlAttribute } from "@/lib/portal-html";
import { portalPages } from "@/lib/portal-config";
import { getCustomSectionsForPage } from "@/lib/custom-sections";
import { getLeadershipSupportContent } from "@/lib/leadership-support";
import { getOverviewContent } from "@/lib/overview-content";
import { getPortalPageWithContent } from "@/lib/portal-navigation";

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
    return appendCustomSections("home", replaceLegacyCourseGrid(replaceLegacyTrainingResourceGrid(replaceLegacyVendorGrids(replaceLegacyLeadershipGrids(replaceLegacyOfficeCards(replaceLegacyOverview(mainHtml)))))));
  }

  if (source === "brand-assets.html") {
    return appendCustomSections("brandAssets", replaceLegacyBrandAssetGrids(mainHtml));
  }

  if (source === "tech/index.html") {
    return appendCustomSections("tech", replaceLegacyTechConnect(mainHtml));
  }

  return mainHtml;
}

function hydrateLegacyOverlaysHtml(source, overlaysHtml) {
  if (source !== "index.html") {
    return overlaysHtml;
  }

  const leadershipSupport = getLeadershipSupportContent(portalContent);
  const mobileBubblePattern = /<a class="mobile-tech-help-bubble"[\s\S]*?<\/a>/;
  const mobileBubbleHtml = `<a class="mobile-tech-help-bubble" href="${escapeHtmlAttribute(leadershipSupport.buttonHref)}" target="_blank" rel="noreferrer" data-editable-type="joe-availability-card" data-editable-id="joeAvailability" data-joe-availability-card data-joe-availability-src="data/joe-tech-status.json" data-joe-primary-action aria-label="Open tech help with Joe">
    <span class="joe-availability-panel joe-availability-panel--mobile-bubble" data-status="unavailable" aria-live="polite">
      <span class="mobile-tech-help-avatar" data-joe-availability-light aria-hidden="true">
        <img src="${escapeHtmlAttribute(leadershipSupport.photo)}" alt="${escapeHtmlAttribute(leadershipSupport.photoAlt || leadershipSupport.title || "Tech Help with Joe")}">
      </span>
      <span class="joe-availability-copy">
        <span class="mobile-tech-help-kicker">${escapeHtml(leadershipSupport.eyebrow || "Tech Help with Joe")}</span>
        <span class="joe-availability-label" data-joe-availability-label>${escapeHtml(leadershipSupport.buttonLabel)}</span>
        <span class="joe-availability-summary" data-joe-availability-summary>${escapeHtml(leadershipSupport.mobileSummary || "Tap to schedule an appointment")}</span>
      </span>
    </span>
  </a>`;

  return overlaysHtml.replace(mobileBubblePattern, mobileBubbleHtml);
}

function replaceLegacyOverview(mainHtml) {
  const overview = getOverviewContent(portalContent);
  const legacyTitlePattern = /(<div class="dashboard-title-block">\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h1>[\s\S]*?<\/h1>\s*<p class="dashboard-summary">[\s\S]*?<\/p>/;
  const legacyDailyAccessPattern = /<article class="dashboard-status-card dashboard-status-card--actions">[\s\S]*?<\/article>/;
  const legacyAgendaPattern = /<article class="dashboard-status-card dashboard-status-card--agenda">[\s\S]*?<\/article>/;
  const legacyRatesHeadPattern = /<span class="dashboard-head-market-kicker">Interest Rates<\/span>\s*<strong class="dashboard-head-market-title">Mortgage Interest Rates<\/strong>/;
  const legacyMarketHeadPattern = /<span class="dashboard-head-market-kicker">RI Market Trends<\/span>\s*<strong class="dashboard-head-market-title">Rhode Island Market<\/strong>/;
  const titleHtml = `<p class="eyebrow small" data-editable-type="overview-heading" data-editable-id="eyebrow">${escapeHtml(overview.eyebrow)}</p><h1 data-editable-type="overview-heading" data-editable-id="title">${escapeHtml(overview.title)}</h1><p class="dashboard-summary" data-editable-type="overview-heading" data-editable-id="summary">${escapeHtml(overview.summary)}</p>`;
  const dailyAccessHtml = `<article class="dashboard-status-card dashboard-status-card--actions" data-editable-type="overview-card" data-editable-id="dailyAccess">
                  <span class="card-tag">${escapeHtml(overview.dailyAccess.tag)}</span>
                  <strong>${escapeHtml(overview.dailyAccess.title)}</strong>
                  <div class="dashboard-quick-grid">
                    ${createOverviewMiniLinksHtml(overview.dailyAccess.links, "dailyAccess")}
                  </div>
                </article>`;
  const agendaHtml = `<article class="dashboard-status-card dashboard-status-card--agenda" data-editable-type="overview-card" data-editable-id="agenda">
                <span class="card-tag">${escapeHtml(overview.agenda.tag)}</span>
                <strong>${escapeHtml(overview.agenda.title)}</strong>
                <div class="dashboard-agenda-shell">
                  <div
                    class="dashboard-agenda-feed"
                    data-tockify-calendar="leading.edge"
                    data-tockify-component="mini"
                    data-tockify-view="agenda"
                    data-tockify-maxevents="3"
                    data-tockify-shownavbar="false"
                    aria-label="Upcoming office training and events"
                  ></div>
                </div>
                <div class="dashboard-agenda-links">
                  ${createOverviewMiniLinksHtml(overview.agenda.links, "agenda")}
                </div>
              </article>`;
  const ratesHeadHtml = `<span class="dashboard-head-market-kicker" data-editable-type="overview-market" data-editable-id="rates">${escapeHtml(overview.rates.eyebrow)}</span><strong class="dashboard-head-market-title" data-editable-type="overview-market" data-editable-id="rates">${escapeHtml(overview.rates.title)}</strong>`;
  const marketHeadHtml = `<span class="dashboard-head-market-kicker" data-editable-type="overview-market" data-editable-id="market">${escapeHtml(overview.market.eyebrow)}</span><strong class="dashboard-head-market-title" data-editable-type="overview-market" data-editable-id="market">${escapeHtml(overview.market.title)}</strong>`;

  return mainHtml
    .replace(legacyTitlePattern, `$1${titleHtml}`)
    .replace(legacyDailyAccessPattern, dailyAccessHtml)
    .replace(legacyAgendaPattern, agendaHtml)
    .replace(legacyRatesHeadPattern, ratesHeadHtml)
    .replace(legacyMarketHeadPattern, marketHeadHtml);
}

function createOverviewMiniLinksHtml(links = [], cardKey) {
  return links
    .filter((link) => link.active !== false)
    .map((link, index) => {
      const externalAttributes = link.external ? ' target="_blank" rel="noreferrer"' : "";
      const calendarAttributes = link.calendarModal ? ' data-calendar-modal-trigger aria-haspopup="dialog" aria-controls="fullCalendarModal"' : "";
      const downloadAttribute = link.download ? " download" : "";

      return `<a class="dashboard-mini-link" data-editable-type="overview-link" data-editable-id="${escapeHtmlAttribute(`${cardKey}:${index}`)}" href="${escapeHtmlAttribute(link.href || "#")}"${externalAttributes}${downloadAttribute}${calendarAttributes}>${escapeHtml(link.label || "")}</a>`;
    })
    .join("\n                    ");
}

function appendCustomSections(pageKey, mainHtml) {
  const customSectionsHtml = createCustomSectionsHtml(getCustomSectionsForPage(portalContent, pageKey));

  return customSectionsHtml ? `${mainHtml}\n${customSectionsHtml}` : mainHtml;
}

function replaceLegacyTechConnect(mainHtml) {
  const techConnect = getTechConnectContent(portalContent);
  const { sections } = techConnect;
  const legacyOverviewHeadPattern = /(<section class="panel directory-panel" id="tech-overview">\s*<div class="directory-head tech-overview-head">\s*<div class="directory-title-block">\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h1>[\s\S]*?<\/h1>\s*<p class="dashboard-summary">[\s\S]*?<\/p>/;
  const legacyJoeSupportPattern = /<div class="tech-overview-aside" id="meet-with-joe"[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="asset-utility-row">)/;
  const legacyQuickLinksPattern = /<div class="asset-utility-row">\s*(?:<a class="chip chip-link"[\s\S]*?<\/a>\s*)+<\/div>/;
  const legacyHelpHeadPattern = /(<section class="panel" id="help-paths">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyHelpGridPattern = /(<section class="panel" id="help-paths">[\s\S]*?)<div class="marketing-tool-grid">\s*(?:<article class="asset-source-card marketing-tool-card">[\s\S]*?<\/article>\s*)+<\/div>/;
  const legacyPaperCutHeadPattern = /(<section class="panel" id="papercut-hive">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyPaperCutGridPattern = /(<section class="panel" id="papercut-hive">[\s\S]*?)<div class="asset-source-grid">\s*(?:<article class="support-card support-card-accent">[\s\S]*?<\/article>\s*)+<\/div>/;
  const legacyAnswersHeadPattern = /(<section class="panel" id="kw-answers">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyAnswersGridPattern = /(<section class="panel" id="kw-answers">[\s\S]*?)<div class="asset-source-grid">\s*(?:<article class="asset-source-card">[\s\S]*?<\/article>\s*)+<\/div>/;
  const overviewHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="techOverview">${escapeHtml(sections.techOverview.eyebrow)}</p><h1 data-editable-type="section-heading" data-editable-id="techOverview">${escapeHtml(sections.techOverview.title)}</h1><p class="dashboard-summary" data-editable-type="section-summary" data-editable-id="techOverview">${escapeHtml(sections.techOverview.summary)}</p>`;
  const helpHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="techHelpPaths">${escapeHtml(sections.techHelpPaths.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="techHelpPaths">${escapeHtml(sections.techHelpPaths.title)}</h2>`;
  const paperCutHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="techPaperCut">${escapeHtml(sections.techPaperCut.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="techPaperCut">${escapeHtml(sections.techPaperCut.title)}</h2>`;
  const answersHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="techAnswers">${escapeHtml(sections.techAnswers.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="techAnswers">${escapeHtml(sections.techAnswers.title)}</h2>`;

  return mainHtml
    .replace(legacyOverviewHeadPattern, `$1${overviewHeadHtml}`)
    .replace(legacyJoeSupportPattern, `${createTechJoeSupportHtml(techConnect.joeSupport)}
            </div>

            `)
    .replace(legacyQuickLinksPattern, createTechQuickLinksHtml(techConnect.quickLinks))
    .replace(legacyHelpHeadPattern, `$1${helpHeadHtml}`)
    .replace(
      legacyHelpGridPattern,
      `$1${createTechCardGridHtml(techConnect.helpPaths, {
        cardClassName: "asset-source-card marketing-tool-card",
        editableType: "tech-help-card",
        gridClassName: "marketing-tool-grid"
      })}`
    )
    .replace(legacyPaperCutHeadPattern, `$1${paperCutHeadHtml}`)
    .replace(
      legacyPaperCutGridPattern,
      `$1${createTechCardGridHtml(techConnect.paperCutCards, {
        cardClassName: "support-card support-card-accent",
        editableType: "tech-papercut-card",
        tagClassName: "card-tag",
        tagElement: "span"
      })}`
    )
    .replace(legacyAnswersHeadPattern, `$1${answersHeadHtml}`)
    .replace(
      legacyAnswersGridPattern,
      `$1${createTechCardGridHtml(techConnect.answerCards, {
        editableType: "tech-answer-card"
      })}`
    );
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
  const vendorDirectorySection = portalContent.sections?.vendorDirectory || {
    eyebrow: "Vendor Directory",
    title: "Preferred office vendors",
    summary: "A fast referral directory for lender, title, insurance, inspection, media, construction, cleaning, moving, and remediation contacts."
  };
  const vendorCoreSection = portalContent.sections?.vendorCore || {
    eyebrow: "Core Partners",
    title: "Vendors agents reach for constantly"
  };
  const vendorServicesSection = portalContent.sections?.vendorServices || {
    eyebrow: "Service Vendors",
    title: "The rest of the vendor directory"
  };
  const legacyVendorDirectoryHeadPattern = /(<section class="panel directory-panel" id="vendor-row">\s*<div class="directory-head">\s*<div class="directory-title-block">\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>\s*<p class="dashboard-summary">[\s\S]*?<\/p>/;
  const legacyVendorCoreHeadPattern = /(<section class="panel" id="vendor-core-partners">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyVendorServicesHeadPattern = /(<section class="panel" id="vendor-services">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const vendorDirectoryHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="vendorDirectory">${escapeHtml(vendorDirectorySection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="vendorDirectory">${escapeHtml(vendorDirectorySection.title)}</h2><p class="dashboard-summary" data-editable-type="section-summary" data-editable-id="vendorDirectory">${escapeHtml(vendorDirectorySection.summary)}</p>`;
  const vendorCoreHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="vendorCore">${escapeHtml(vendorCoreSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="vendorCore">${escapeHtml(vendorCoreSection.title)}</h2>`;
  const vendorServicesHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="vendorServices">${escapeHtml(vendorServicesSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="vendorServices">${escapeHtml(vendorServicesSection.title)}</h2>`;

  return mainHtml
    .replace(legacyVendorDirectoryHeadPattern, `$1${vendorDirectoryHeadHtml}`)
    .replace(legacyVendorCoreHeadPattern, `$1${vendorCoreHeadHtml}`)
    .replace(legacyVendorServicesHeadPattern, `$1${vendorServicesHeadHtml}`)
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
  const leadershipSupport = getLeadershipSupportContent(portalContent);
  const legacyLeadershipHeadPattern = /(<section class="panel" id="leadership">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const legacyAlcHeadPattern = /(<article class="alc-card" id="alc-board">\s*<div class="alc-card-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h3>[\s\S]*?<\/h3>\s*<p class="alc-card-summary">[\s\S]*?<\/p>/;
  const legacyLeadershipSupportPattern = /<article class="leadership-support-card" id="leadership-support"[\s\S]*?<\/article>/;
  const leadershipHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="leadership">${escapeHtml(leadershipSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="leadership">${escapeHtml(leadershipSection.title)}</h2>`;
  const alcHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="alc">${escapeHtml(alcSection.eyebrow)}</p><h3 data-editable-type="section-heading" data-editable-id="alc">${escapeHtml(alcSection.title)}</h3><p class="alc-card-summary" data-editable-type="section-summary" data-editable-id="alc">${escapeHtml(alcSection.summary)}</p>`;
  const supportPhoto = leadershipSupport.photo || "team/joe-pine-chair.jpg";
  const supportPhotoAlt = leadershipSupport.photoAlt || leadershipSupport.title || "Tech Help with Joe";
  const leadershipSupportHtml = `<article class="leadership-support-card" id="leadership-support" data-editable-type="leadership-support-card" data-editable-id="leadershipSupport" data-joe-availability-card data-joe-availability-src="data/joe-tech-status.json">
          <img src="${escapeHtmlAttribute(supportPhoto)}" alt="${escapeHtmlAttribute(supportPhotoAlt)}" class="leadership-support-photo" data-editable-type="leadership-support-field" data-editable-id="leadershipSupport:photo">
          <div class="leadership-support-copy">
            <p class="eyebrow small" data-editable-type="leadership-support-field" data-editable-id="leadershipSupport:eyebrow">${escapeHtml(leadershipSupport.eyebrow)}</p>
            <h3 data-editable-type="leadership-support-field" data-editable-id="leadershipSupport:title">${escapeHtml(leadershipSupport.title)}</h3>
            <p class="leadership-support-summary" data-editable-type="leadership-support-field" data-editable-id="leadershipSupport:summary">${escapeHtml(leadershipSupport.summary)}</p>
          </div>
          <div class="joe-availability-panel joe-availability-panel--leadership" data-status="unavailable" aria-live="polite">
            <span class="joe-availability-light" data-joe-availability-light aria-hidden="true"></span>
            <div class="joe-availability-copy">
              <p class="joe-availability-label" data-joe-availability-label>Joe is unavailable</p>
              <p class="joe-availability-summary" data-joe-availability-summary>No open tech-help slots are listed right now.</p>
            </div>
          </div>
          <div class="leadership-support-actions">
            <a class="button secondary leadership-support-button" href="${escapeHtmlAttribute(leadershipSupport.buttonHref)}" target="_blank" rel="noreferrer" data-joe-primary-action data-editable-type="leadership-support-field" data-editable-id="leadershipSupport:button">${escapeHtml(leadershipSupport.buttonLabel)}</a>
          </div>
        </article>`;

  return mainHtml
    .replace(legacyLeadershipHeadPattern, `$1${leadershipHeadHtml}`)
    .replace(legacyAlcHeadPattern, `$1${alcHeadHtml}`)
    .replace(legacyLeadershipSupportPattern, leadershipSupportHtml)
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
  const brandOverviewSection = portalContent.sections?.brandOverview || {
    eyebrow: "Marketing + Brand Assets",
    title: "Marketing tools, logo previews, and downloads",
    summary: "Open Keller Williams marketing tools, onboarding help, standards, and ordering links first, then jump into logo previews and source files when you need exact artwork."
  };
  const marketingToolsSection = portalContent.sections?.marketingTools || {
    eyebrow: "Marketing Tools",
    title: "The links agents usually need first"
  };
  const digitalLogosSection = portalContent.sections?.digitalLogos || {
    eyebrow: "Digital Logos",
    title: "Preview before downloading"
  };
  const sourceFilesSection = portalContent.sections?.sourceFiles || {
    eyebrow: "Source Files",
    title: "EPS artwork and print-ready files"
  };
  const brandOverviewHeadPattern = /(<section class="panel directory-panel" id="brand-overview">\s*<div class="directory-head">\s*<div class="directory-title-block">\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h1>[\s\S]*?<\/h1>\s*<p class="dashboard-summary">[\s\S]*?<\/p>/;
  const marketingToolsHeadPattern = /(<section class="panel" id="marketing-tools">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const digitalLogosHeadPattern = /(<section class="panel" id="digital-logos">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const sourceFilesHeadPattern = /(<section class="panel" id="source-files">\s*<div class="section-head">\s*<div>\s*)<p class="eyebrow small">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/;
  const brandOverviewHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="brandOverview">${escapeHtml(brandOverviewSection.eyebrow)}</p><h1 data-editable-type="section-heading" data-editable-id="brandOverview">${escapeHtml(brandOverviewSection.title)}</h1><p class="dashboard-summary" data-editable-type="section-summary" data-editable-id="brandOverview">${escapeHtml(brandOverviewSection.summary)}</p>`;
  const marketingToolsHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="marketingTools">${escapeHtml(marketingToolsSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="marketingTools">${escapeHtml(marketingToolsSection.title)}</h2>`;
  const digitalLogosHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="digitalLogos">${escapeHtml(digitalLogosSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="digitalLogos">${escapeHtml(digitalLogosSection.title)}</h2>`;
  const sourceFilesHeadHtml = `<p class="eyebrow small" data-editable-type="section-eyebrow" data-editable-id="sourceFiles">${escapeHtml(sourceFilesSection.eyebrow)}</p><h2 data-editable-type="section-heading" data-editable-id="sourceFiles">${escapeHtml(sourceFilesSection.title)}</h2>`;

  return mainHtml
    .replace(brandOverviewHeadPattern, `$1${brandOverviewHeadHtml}`)
    .replace(marketingToolsHeadPattern, `$1${marketingToolsHeadHtml}`)
    .replace(digitalLogosHeadPattern, `$1${digitalLogosHeadHtml}`)
    .replace(sourceFilesHeadPattern, `$1${sourceFilesHeadHtml}`)
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
  const page = getPortalPageWithContent(pageKey, portalPages[pageKey], portalContent);
  const { mainHtml, overlaysHtml } = getLegacyPortalFragments(source);
  const hydratedOverlaysHtml = hydrateLegacyOverlaysHtml(source, overlaysHtml);

  return (
    <>
      <PortalBodyState lockLabel={page.lockLabel} />
      <PortalShell mainHtml={mainHtml} overlaysHtml={hydratedOverlaysHtml} page={page} />
    </>
  );
}
