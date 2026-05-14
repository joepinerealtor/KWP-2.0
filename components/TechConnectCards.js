import { createLinkAttributes, escapeHtml, escapeHtmlAttribute } from "@/lib/portal-html";

function createChipLinksHtml(links = []) {
  return links
    .map((link) => `<a class="chip chip-link" ${createLinkAttributes(link)}>${escapeHtml(link.label)}</a>`)
    .join("");
}

export function createTechQuickLinksHtml(links = []) {
  return `<div class="asset-utility-row" data-editable-type="tech-quick-links" data-editable-id="techQuickLinks">${createChipLinksHtml(links)}</div>`;
}

export function createTechJoeSupportHtml(joeSupport = {}) {
  const phoneDigits = String(joeSupport.phone || "").replace(/\D/g, "");
  const phoneHref = phoneDigits ? `tel:+1${phoneDigits.length === 10 ? phoneDigits : phoneDigits.replace(/^1/, "")}` : "";

  return `<div class="tech-overview-aside" id="meet-with-joe" data-editable-type="tech-joe-support" data-editable-id="techJoeSupport" data-joe-availability-card data-joe-availability-src="../data/joe-tech-status.json">
                <div class="joe-support-profile">
                  <img src="${escapeHtmlAttribute(joeSupport.photo)}" alt="${escapeHtmlAttribute(joeSupport.photoAlt || joeSupport.name)}" class="joe-support-profile-photo">
                  <div class="joe-support-profile-copy">
                    <p class="eyebrow small">${escapeHtml(joeSupport.name)}</p>
                    <p class="joe-support-profile-title">${escapeHtml(joeSupport.role)}</p>
                    <div class="joe-support-contact-list">
                      <a class="joe-support-contact-link" href="${escapeHtmlAttribute(phoneHref)}">${escapeHtml(joeSupport.phone)}</a>
                      <a class="joe-support-contact-link" href="mailto:${escapeHtmlAttribute(joeSupport.email)}?subject=KW%20Tech%20Question">${escapeHtml(joeSupport.email)}</a>
                    </div>
                  </div>
                </div>
                <div class="joe-availability-panel" data-status="unavailable" aria-live="polite">
                  <span class="joe-availability-light" data-joe-availability-light aria-hidden="true"></span>
                  <div class="joe-availability-copy">
                    <p class="joe-availability-label" data-joe-availability-label>Joe is unavailable</p>
                    <p class="joe-availability-summary" data-joe-availability-summary>No open tech-help slots are listed right now.</p>
                  </div>
                </div>
                <div class="directory-actions tech-overview-actions">
                  <a class="button primary compact" href="${escapeHtmlAttribute(joeSupport.buttonHref)}" target="_blank" rel="noreferrer">${escapeHtml(joeSupport.buttonLabel)}</a>
                  <a class="button secondary compact" href="#help-paths">Get Help</a>
                  <a class="button secondary compact" href="#papercut-hive">PaperCut Hive</a>
                  <a class="button secondary compact" href="#kw-answers">KW Answers</a>
                </div>
              </div>`;
}

export function createTechCardGridHtml(cards = [], {
  cardClassName = "asset-source-card",
  editableType,
  gridClassName = "asset-source-grid",
  tagClassName = "eyebrow small",
  tagElement = "p"
} = {}) {
  const cardHtml = cards
    .filter((card) => card.active !== false)
    .map((card) => createTechCardHtml(card, {
      cardClassName,
      editableType,
      tagClassName,
      tagElement
    }))
    .join("");

  return `<div class="${gridClassName}">${cardHtml}</div>`;
}

function createTechCardHtml(card, {
  cardClassName,
  editableType,
  tagClassName,
  tagElement
}) {
  const summary = card.summary ? `<p>${escapeHtml(card.summary)}</p>` : "";
  const secondarySummary = card.secondarySummary ? `<p>${escapeHtml(card.secondarySummary)}</p>` : "";
  const links = card.links?.length ? `<div class="chip-row asset-downloads">${createChipLinksHtml(card.links)}</div>` : "";

  return `<article class="${cardClassName}" data-editable-type="${escapeHtmlAttribute(editableType)}" data-editable-id="${escapeHtmlAttribute(card.id)}">
                <${tagElement} class="${tagClassName}">${escapeHtml(card.kicker)}</${tagElement}>
                <h3>${escapeHtml(card.title)}</h3>
                ${summary}
                ${secondarySummary}
                ${links}
              </article>`;
}
