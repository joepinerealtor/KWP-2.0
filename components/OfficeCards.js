import { createLinkAttributes, escapeHtml, escapeHtmlAttribute } from "@/lib/portal-html";

function createChipHtml(chip, index, cardKey) {
  const editableAttributes = cardKey
    ? ` data-editable-type="office-chip" data-editable-id="${escapeHtmlAttribute(`${cardKey}:${index}`)}"`
    : "";

  if (chip.href) {
    const extraAttributes = chip.handbookModal
      ? ["data-handbook-modal-trigger", 'aria-haspopup="dialog"', 'aria-controls="agentHandbookModal"']
      : [];

    return `<a class="chip chip-link"${editableAttributes} ${createLinkAttributes(chip, extraAttributes)}>${escapeHtml(chip.label)}</a>`;
  }

  return `<span class="chip"${editableAttributes}>${escapeHtml(chip.label)}</span>`;
}

function createChipRowHtml(chips = [], cardKey) {
  return `<div class="chip-row">${chips.map((chip, index) => createChipHtml(chip, index, cardKey)).join("")}</div>`;
}

export function createOfficeGridHtml(office = {}, leadershipSupport = {}) {
  const cards = [
    createTechHelpCardHtml(leadershipSupport),
    createReferenceCardHtml(office.referenceHub),
    createOperationsCardHtml(office.operations),
    createMarketingFilesCardHtml(office.marketingFiles)
  ].join("");

  return `<div class="office-grid">${cards}</div>`;
}

function createTechHelpCardHtml(joeSupport = {}) {
  const bookingHref = joeSupport.buttonHref || "https://calendly.com/joepinerealtor/tech-meeting-with-joe";
  const bookingLabel = joeSupport.buttonLabel || "Schedule Tech Help with Joe";
  const photo = joeSupport.photo || "team/joe-pine-chair.jpg";
  const photoAlt = joeSupport.photoAlt || "Joe Pine";
  const topics = joeSupport.topics || ["KW Command", "Lone Wolf", "Canva", "Agent Portal", "Social Media", "Everyday Tech"];
  const topicHtml = topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join("");

  return `<article class="office-card office-card-wide office-card-accent office-tech-help-card" id="tech-help-joe" data-joe-availability-card data-joe-availability-src="data/joe-tech-status.json"><div class="office-tech-help-main"><div class="office-tech-help-layout"><img src="${escapeHtmlAttribute(photo)}" alt="${escapeHtmlAttribute(photoAlt)}" class="office-tech-help-photo"><div class="office-tech-help-copy"><span class="card-tag">Tech Support</span><h3>Meet Your Keller Williams Market Center Tech Trainer, Joe Pine</h3><p>Need help with KW Command, Lone Wolf, Canva, the Agent Portal, or other real estate technology tools? Schedule time with Joe Pine, your Keller Williams Market Center Tech Trainer, for one-on-one support, troubleshooting, or guidance to help you feel more confident using the systems that support your business.</p></div></div><div class="office-tech-help-tools" aria-label="Common tech-help topics">${topicHtml}</div></div><div class="office-tech-help-actions"><p class="office-tech-help-action-label">Live availability</p><div class="joe-availability-panel joe-availability-panel--office" data-status="unavailable" aria-live="polite"><span class="joe-availability-light" data-joe-availability-light aria-hidden="true"></span><div class="joe-availability-copy"><p class="joe-availability-label" data-joe-availability-label>Joe is unavailable</p><p class="joe-availability-summary" data-joe-availability-summary>No open tech-help slots are listed right now.</p></div></div><a class="button secondary compact" href="${escapeHtmlAttribute(bookingHref)}" target="_blank" rel="noreferrer" data-joe-primary-action data-joe-action-label="${escapeHtmlAttribute(bookingLabel)}">${escapeHtml(bookingLabel)}</a></div></article>`;
}

function createReferenceCardHtml(card = {}) {
  if (card.handbookPreview || card.info || card.action) {
    return createRichReferenceCardHtml(card);
  }

  const action = card.action
    ? `<a class="button secondary compact" data-editable-type="office-card" data-editable-id="referenceHub" ${createLinkAttributes(card.action)}>${escapeHtml(card.action.label)}</a>`
    : "";

  return `<article class="office-card" data-editable-type="office-card" data-editable-id="referenceHub"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.summary)}</p>${createChipRowHtml(card.chips, "referenceHub")}${action}</article>`;
}

function createRichReferenceCardHtml(card = {}) {
  const defaultChips = [
    {
      label: "Sales Associate Handbook",
      href: "downloads/kwle-agent-handbook-march-2026.pdf",
      handbookModal: true
    },
    {
      label: "Vendor Row",
      href: "#vendor-row"
    }
  ];
  const preview = card.handbookPreview || {
    href: "downloads/kwle-agent-handbook-march-2026.pdf",
    image: {
      src: "images/agent-handbook-preview.png",
      alt: "Sales Associate Handbook PDF preview"
    },
    kicker: "Sales Associate Handbook",
    label: "Open the Handbook"
  };
  const info = card.info || {
    ariaLabel: "Important office information",
    kicker: "Important Office Information",
    title: "Keller Williams Leading Edge #715",
    addressLines: ["28 Thurber Blvd", "Smithfield, RI 02917", "401-333-4900"],
    items: [
      { label: "Office MA MLS Number", value: "AN2275" },
      { label: "Office RI MLS Number", value: "KELW03" },
      { label: "Office RI Broker License", value: "B14022" },
      { label: "Office MA Broker License", value: "139245" },
      { label: "Office CT Broker License", value: "0790330" },
      { label: "Office Tax ID", value: "20-5512965" },
      { label: "WiFi Password", value: "Agents: profitshare" }
    ]
  };
  const address = Array.isArray(info.addressLines) && info.addressLines.length
    ? `<address class="office-info-address">${info.addressLines.map((line) => escapeHtml(line)).join("<br>")}</address>`
    : "";
  const infoRows = (info.items || [])
    .map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`)
    .join("");
  const previewHref = preview.href || "downloads/kwle-agent-handbook-march-2026.pdf";
  const previewImage = preview.image || {};
  const previewAttributes = [
    "data-handbook-modal-trigger",
    'aria-haspopup="dialog"',
    'aria-controls="agentHandbookModal"'
  ];
  const summary = card.handbookPreview || card.info
    ? card.summary
    : "Keep the handbook, vendor row, and office files in one reliable place.";

  return `<article class="office-card office-reference-card" data-editable-type="office-card" data-editable-id="referenceHub"><div class="office-reference-main"><div class="office-reference-copy"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(summary)}</p><div class="chip-row office-reference-actions">${(card.handbookPreview || card.info ? card.chips || defaultChips : defaultChips).map((chip, index) => createChipHtml(chip, index, "referenceHub")).join("")}</div></div><a class="handbook-preview-card" ${createLinkAttributes({ href: previewHref }, previewAttributes)}><span class="handbook-preview-card__media"><img src="${escapeHtmlAttribute(previewImage.src || "images/agent-handbook-preview.png")}" alt="${escapeHtmlAttribute(previewImage.alt || "Sales Associate Handbook PDF preview")}"></span><span class="handbook-preview-card__copy"><span>${escapeHtml(preview.kicker || "Sales Associate Handbook")}</span><strong>${escapeHtml(preview.label || "Open the Handbook")}</strong></span></a></div><div class="office-reference-info" aria-label="${escapeHtmlAttribute(info.ariaLabel || "Important office information")}"><div class="office-info-head"><span class="office-info-kicker">${escapeHtml(info.kicker || "Important Office Information")}</span><h4>${escapeHtml(info.title || "Keller Williams Leading Edge #715")}</h4>${address}</div><dl class="office-info-list">${infoRows}</dl></div></article>`;
}

function createOperationsCardHtml(card = {}) {
  const hours = (card.hours || [])
    .map((item) => `<li><strong>${escapeHtml(item.days)}</strong><span>${escapeHtml(item.time)}</span></li>`)
    .join("");
  const holidays = (card.holidays || [])
    .map((holiday) => `<li>${escapeHtml(holiday)}</li>`)
    .join("");

  return `<article class="office-card office-operations-card" data-editable-type="office-card" data-editable-id="operations"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><div class="office-operations-block"><p class="office-operations-label">${escapeHtml(card.hoursLabel)}</p><ul class="office-hours-list">${hours}</ul></div><div class="office-operations-block"><p class="office-operations-label">${escapeHtml(card.holidaysLabel)}</p><ul class="office-holiday-list">${holidays}</ul></div></article>`;
}

function createMarketingFilesCardHtml(card = {}) {
  return `<article class="office-card office-card-wide" data-editable-type="office-card" data-editable-id="marketingFiles"><a class="card-tag card-tag-link" data-editable-type="office-card" data-editable-id="marketingFiles" href="${escapeHtmlAttribute(card.tagHref)}">${escapeHtml(card.tag)}</a><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.summary)}</p>${createChipRowHtml(card.chips, "marketingFiles")}</article>`;
}

export function createRoomBookingCardHtml(rooms = {}) {
  const buttons = (rooms.actions || [])
    .map((action, index) => `<button type="button" class="button primary compact room-booking-trigger" data-editable-type="room-action" data-editable-id="${index}" data-room-booking-label="${escapeHtmlAttribute(action.label)}" data-room-booking-url="${escapeHtmlAttribute(withCalendlyEmbedDomain(action.url))}">${escapeHtml(action.label)}</button>`)
    .join("");
  const calendars = (rooms.calendars || [])
    .map((calendar, index) => `<section class="office-calendar-card" data-editable-type="room-calendar" data-editable-id="${index}"><div class="office-calendar-head"><p class="office-operations-label">${escapeHtml(calendar.label)}</p></div><iframe class="office-calendar-frame" title="${escapeHtmlAttribute(calendar.title)}" src="${escapeHtmlAttribute(calendar.src)}" loading="lazy"></iframe></section>`)
    .join("");

  return `<article class="office-card office-booking-card" data-editable-type="room-booking-card" data-editable-id="rooms"><p>${escapeHtml(rooms.summary)}</p><div class="office-booking-actions">${buttons}</div><div class="office-calendar-grid">${calendars}</div></article>`;
}

function withCalendlyEmbedDomain(url = "") {
  if (!url.includes("calendly.com") || url.includes("embed_domain=")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}embed_domain=agent.kwleadingedge.com`;
}
