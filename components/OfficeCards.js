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
    ? `<a class="button secondary compact" data-editable-type="office-card" data-editable-id="referenceHub" ${createLinkAttributes(card.action)}>${escapeHtml(card.action.label)}</a>`
    : "";

  return `<article class="office-card" data-editable-type="office-card" data-editable-id="referenceHub"><span class="card-tag">${escapeHtml(card.tag)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.summary)}</p>${createChipRowHtml(card.chips, "referenceHub")}${action}</article>`;
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
    .map((action, index) => `<button type="button" class="button primary compact room-booking-trigger" data-editable-type="room-action" data-editable-id="${index}" data-room-booking-label="${escapeHtmlAttribute(action.label)}" data-room-booking-url="${escapeHtmlAttribute(action.url)}">${escapeHtml(action.label)}</button>`)
    .join("");
  const calendars = (rooms.calendars || [])
    .map((calendar, index) => `<section class="office-calendar-card" data-editable-type="room-calendar" data-editable-id="${index}"><div class="office-calendar-head"><p class="office-operations-label">${escapeHtml(calendar.label)}</p></div><iframe class="office-calendar-frame" title="${escapeHtmlAttribute(calendar.title)}" src="${escapeHtmlAttribute(calendar.src)}" loading="lazy"></iframe></section>`)
    .join("");

  return `<article class="office-card office-booking-card" data-editable-type="room-booking-card" data-editable-id="rooms"><p>${escapeHtml(rooms.summary)}</p><div class="office-booking-actions">${buttons}</div><div class="office-calendar-grid">${calendars}</div></article>`;
}
