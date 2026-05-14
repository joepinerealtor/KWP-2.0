import { createLinkAttributes, escapeHtml, escapeHtmlAttribute } from "@/lib/portal-html";

export function createCustomSectionsHtml(sections = []) {
  return sections
    .filter(isVisible)
    .map(createCustomSectionHtml)
    .join("\n");
}

export function createCustomSectionHtml(section) {
  const sectionSummary = section.summary || section.description || "";
  const eyebrow = section.eyebrow
    ? `<p class="eyebrow small" data-editable-type="custom-section-eyebrow" data-editable-id="${escapeHtmlAttribute(section.id)}">${escapeHtml(section.eyebrow)}</p>`
    : "";
  const summary = sectionSummary
    ? `<p class="dashboard-summary" data-editable-type="custom-section-summary" data-editable-id="${escapeHtmlAttribute(section.id)}">${escapeHtml(sectionSummary)}</p>`
    : "";
  const cards = (section.cards || [])
    .filter(isVisible)
    .map((card) => createCustomSectionCardHtml(section.id, card))
    .join("");

  return `<section class="panel" id="${escapeHtmlAttribute(section.id)}" data-editable-type="custom-section" data-editable-id="${escapeHtmlAttribute(section.id)}">
          <div class="section-head">
            <div>
              ${eyebrow}
              <h2 data-editable-type="custom-section-heading" data-editable-id="${escapeHtmlAttribute(section.id)}">${escapeHtml(section.title)}</h2>
              ${summary}
            </div>
          </div>
          <div class="asset-source-grid" data-custom-section-grid="${escapeHtmlAttribute(section.id)}">${cards}</div>
        </section>`;
}

export function createCustomSectionCardHtml(sectionId, card) {
  const cardSummary = card.summary || card.description || "";
  const kicker = card.kicker || card.tag || "";
  const links = getCustomSectionCardLinks(card)
    .map((link) => `<a class="chip chip-link" ${createLinkAttributes(link)}>${escapeHtml(link.label)}</a>`)
    .join("");

  return `<article class="asset-source-card custom-section-card" data-editable-type="custom-section-card" data-editable-id="${escapeHtmlAttribute(sectionId)}:${escapeHtmlAttribute(card.id)}">
              ${kicker ? `<p class="eyebrow small">${escapeHtml(kicker)}</p>` : ""}
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(cardSummary)}</p>
              <div class="chip-row asset-downloads">${links}</div>
            </article>`;
}

function getCustomSectionCardLinks(card) {
  if (Array.isArray(card.links) && card.links.length) {
    return card.links;
  }

  if (card.href || card.link || card.buttonHref) {
    return [
      {
        label: card.buttonLabel || card.linkLabel || "Open Link",
        href: card.href || card.link || card.buttonHref,
        external: Boolean(card.external),
        download: Boolean(card.download)
      }
    ];
  }

  return [];
}

function isVisible(item) {
  return item?.active !== false && item?.visible !== false;
}
