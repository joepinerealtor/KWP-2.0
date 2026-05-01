function linkAttributes(link) {
  const attrs = [`href="${escapeHtmlAttribute(link.href)}"`];

  if (link.external) {
    attrs.push('target="_blank"', 'rel="noreferrer"');
  }

  if (link.download) {
    attrs.push("download");
  }

  if (link.handbookModal) {
    attrs.push("data-handbook-modal-trigger", 'aria-haspopup="dialog"', 'aria-controls="agentHandbookModal"');
  }

  return attrs.join(" ");
}

function createChipHtml(chip) {
  if (chip.href) {
    return `<a class="chip chip-link" ${linkAttributes(chip)}>${escapeHtml(chip.label)}</a>`;
  }

  return `<span class="chip">${escapeHtml(chip.label)}</span>`;
}

function createChipRowHtml(chips = []) {
  return `<div class="chip-row">${chips.map(createChipHtml).join("")}</div>`;
}

export function createOfficeGridHtml(office = {}) {
  const cards = [
    createReferenceCardHtml(office.referenceHub),
    createOperationsCardHtml(office.operations),
    createMarketingFilesCardHtml(office.marketingFiles)
  ].join("");

  return `<div class="office-grid">${cards}</div>`;
}

function createReferenceCardHtml(card = {}) {
  const action = card.action
    ? `<a class="button secondary compact" ${linkAttributes(card.action)}>${escapeHtml(card.action.label)}</a>`
    : "";

  return `<article class="office-card"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.summary)}</p>${createChipRowHtml(card.chips)}${action}</article>`;
}

function createOperationsCardHtml(card = {}) {
  const hours = (card.hours || [])
    .map((item) => `<li><strong>${escapeHtml(item.days)}</strong><span>${escapeHtml(item.time)}</span></li>`)
    .join("");
  const holidays = (card.holidays || [])
    .map((holiday) => `<li>${escapeHtml(holiday)}</li>`)
    .join("");

  return `<article class="office-card office-operations-card"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><div class="office-operations-block"><p class="office-operations-label">${escapeHtml(card.hoursLabel)}</p><ul class="office-hours-list">${hours}</ul></div><div class="office-operations-block"><p class="office-operations-label">${escapeHtml(card.holidaysLabel)}</p><ul class="office-holiday-list">${holidays}</ul></div></article>`;
}

function createMarketingFilesCardHtml(card = {}) {
  return `<article class="office-card office-card-wide"><a class="card-tag card-tag-link" href="${escapeHtmlAttribute(card.tagHref)}">${escapeHtml(card.tag)}</a><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.summary)}</p>${createChipRowHtml(card.chips)}</article>`;
}

export function createRoomBookingCardHtml(rooms = {}) {
  const buttons = (rooms.actions || [])
    .map((action) => `<button type="button" class="button primary compact room-booking-trigger" data-room-booking-label="${escapeHtmlAttribute(action.label)}" data-room-booking-url="${escapeHtmlAttribute(action.url)}">${escapeHtml(action.label)}</button>`)
    .join("");
  const calendars = (rooms.calendars || [])
    .map((calendar) => `<section class="office-calendar-card"><div class="office-calendar-head"><p class="office-operations-label">${escapeHtml(calendar.label)}</p></div><iframe class="office-calendar-frame" title="${escapeHtmlAttribute(calendar.title)}" src="${escapeHtmlAttribute(calendar.src)}" loading="lazy"></iframe></section>`)
    .join("");

  return `<article class="office-card office-booking-card"><p>${escapeHtml(rooms.summary)}</p><div class="office-booking-actions">${buttons}</div><div class="office-calendar-grid">${calendars}</div></article>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlAttribute(value = "") {
  return escapeHtml(value);
}
