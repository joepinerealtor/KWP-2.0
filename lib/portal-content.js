const fs = require("node:fs");
const path = require("node:path");

const CANONICAL_CONTENT_PATH = path.join(process.cwd(), "data", "portal-content.json");
const PUBLIC_CONTENT_PATH = path.join(process.cwd(), "public", "data", "portal-content.json");

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function formatPortalContent(content) {
  return `${JSON.stringify(content, null, 2)}\n`;
}

function loadPortalContent(filePath = CANONICAL_CONTENT_PATH) {
  return readJsonFile(filePath);
}

function writePortalContent(content, filePath = CANONICAL_CONTENT_PATH) {
  fs.writeFileSync(filePath, formatPortalContent(content), "utf8");
}

function syncPortalContent() {
  const content = loadPortalContent(CANONICAL_CONTENT_PATH);
  validatePortalContent(content);
  fs.mkdirSync(path.dirname(PUBLIC_CONTENT_PATH), { recursive: true });
  fs.copyFileSync(CANONICAL_CONTENT_PATH, PUBLIC_CONTENT_PATH);
}

function validatePortalContent(content) {
  const errors = [];

  requireObject(content, "portal content", errors);
  requireArray(content.courses, "courses", errors);
  requireArray(content.leadership, "leadership", errors);
  requireArray(content.vendors, "vendors", errors);
  requireObject(content.brandAssets, "brandAssets", errors);
  requireObject(content.office, "office", errors);

  validateCourses(content.courses || [], errors);
  validateLeadership(content.leadership || [], errors);
  validateVendors(content.vendors || [], errors);
  validateBrandAssets(content.brandAssets || {}, errors);
  validateOffice(content.office || {}, errors);

  if (errors.length) {
    const error = new Error(`Portal content validation failed:\n- ${errors.join("\n- ")}`);
    error.validationErrors = errors;
    throw error;
  }

  return true;
}

function validateCourses(courses, errors) {
  validateUniqueIds(courses, "courses", errors);

  courses.forEach((course, index) => {
    const pathLabel = `courses[${index}]`;
    requireString(course.id, `${pathLabel}.id`, errors);
    requireString(course.tag, `${pathLabel}.tag`, errors);
    requireString(course.title, `${pathLabel}.title`, errors);
    requireString(course.summary, `${pathLabel}.summary`, errors);
    requireString(course.href, `${pathLabel}.href`, errors);
  });
}

function validateLeadership(leaders, errors) {
  validateUniqueIds(leaders, "leadership", errors);

  leaders.forEach((person, index) => {
    const pathLabel = `leadership[${index}]`;
    requireString(person.id, `${pathLabel}.id`, errors);
    requireString(person.group, `${pathLabel}.group`, errors);
    requireString(person.role, `${pathLabel}.role`, errors);
    requireString(person.name, `${pathLabel}.name`, errors);
    requireString(person.photo, `${pathLabel}.photo`, errors);
  });
}

function validateVendors(vendors, errors) {
  validateUniqueIds(vendors, "vendors", errors);

  vendors.forEach((vendor, index) => {
    const pathLabel = `vendors[${index}]`;
    requireString(vendor.id, `${pathLabel}.id`, errors);
    requireString(vendor.section, `${pathLabel}.section`, errors);
    requireString(vendor.business, `${pathLabel}.business`, errors);
    requireString(vendor.logo, `${pathLabel}.logo`, errors);
    requireString(vendor.name, `${pathLabel}.name`, errors);
    requireString(vendor.notes, `${pathLabel}.notes`, errors);
  });
}

function validateBrandAssets(brandAssets, errors) {
  requireArray(brandAssets.marketingTools, "brandAssets.marketingTools", errors);
  requireArray(brandAssets.digitalLogos, "brandAssets.digitalLogos", errors);
  requireArray(brandAssets.sourceFiles, "brandAssets.sourceFiles", errors);

  validateMarketingTools(brandAssets.marketingTools || [], errors);
  validateDigitalLogos(brandAssets.digitalLogos || [], errors);
  validateSourceFiles(brandAssets.sourceFiles || [], errors);
}

function validateMarketingTools(tools, errors) {
  validateUniqueIds(tools, "brandAssets.marketingTools", errors);

  tools.forEach((tool, index) => {
    const pathLabel = `brandAssets.marketingTools[${index}]`;
    requireString(tool.id, `${pathLabel}.id`, errors);
    requireString(tool.kicker, `${pathLabel}.kicker`, errors);
    requireString(tool.title, `${pathLabel}.title`, errors);
    requireString(tool.summary, `${pathLabel}.summary`, errors);
    validateLinks(tool.links, `${pathLabel}.links`, errors);
  });
}

function validateDigitalLogos(logos, errors) {
  validateUniqueIds(logos, "brandAssets.digitalLogos", errors);

  logos.forEach((logo, index) => {
    const pathLabel = `brandAssets.digitalLogos[${index}]`;
    requireString(logo.id, `${pathLabel}.id`, errors);
    requireString(logo.kicker, `${pathLabel}.kicker`, errors);
    requireString(logo.title, `${pathLabel}.title`, errors);
    requireString(logo.summary, `${pathLabel}.summary`, errors);
    requireString(logo.previewClass, `${pathLabel}.previewClass`, errors);
    requireObject(logo.image, `${pathLabel}.image`, errors);
    requireString(logo.image?.src, `${pathLabel}.image.src`, errors);
    requireString(logo.image?.alt, `${pathLabel}.image.alt`, errors);
    validateLinks(logo.links, `${pathLabel}.links`, errors);
  });
}

function validateSourceFiles(files, errors) {
  validateUniqueIds(files, "brandAssets.sourceFiles", errors);

  files.forEach((file, index) => {
    const pathLabel = `brandAssets.sourceFiles[${index}]`;
    requireString(file.id, `${pathLabel}.id`, errors);
    requireString(file.kicker, `${pathLabel}.kicker`, errors);
    requireString(file.title, `${pathLabel}.title`, errors);
    validateLinks(file.links, `${pathLabel}.links`, errors);
  });
}

function validateOffice(office, errors) {
  requireObject(office.referenceHub, "office.referenceHub", errors);
  requireObject(office.operations, "office.operations", errors);
  requireObject(office.marketingFiles, "office.marketingFiles", errors);
  requireObject(office.rooms, "office.rooms", errors);

  validateOfficeCard(office.referenceHub || {}, "office.referenceHub", errors);
  validateOfficeCard(office.marketingFiles || {}, "office.marketingFiles", errors);
  validateOfficeOperations(office.operations || {}, errors);
  validateRooms(office.rooms || {}, errors);
}

function validateOfficeCard(card, pathLabel, errors) {
  requireString(card.tag, `${pathLabel}.tag`, errors);
  requireString(card.title, `${pathLabel}.title`, errors);
  requireString(card.summary, `${pathLabel}.summary`, errors);
  requireArray(card.chips, `${pathLabel}.chips`, errors);
  (card.chips || []).forEach((chip, index) => {
    requireString(chip.label, `${pathLabel}.chips[${index}].label`, errors);
  });
}

function validateOfficeOperations(operations, errors) {
  requireString(operations.tag, "office.operations.tag", errors);
  requireString(operations.title, "office.operations.title", errors);
  requireString(operations.hoursLabel, "office.operations.hoursLabel", errors);
  requireArray(operations.hours, "office.operations.hours", errors);
  requireString(operations.holidaysLabel, "office.operations.holidaysLabel", errors);
  requireArray(operations.holidays, "office.operations.holidays", errors);
}

function validateRooms(rooms, errors) {
  requireString(rooms.summary, "office.rooms.summary", errors);
  requireArray(rooms.actions, "office.rooms.actions", errors);
  requireArray(rooms.calendars, "office.rooms.calendars", errors);

  (rooms.actions || []).forEach((action, index) => {
    requireString(action.label, `office.rooms.actions[${index}].label`, errors);
    requireString(action.url, `office.rooms.actions[${index}].url`, errors);
  });

  (rooms.calendars || []).forEach((calendar, index) => {
    requireString(calendar.label, `office.rooms.calendars[${index}].label`, errors);
    requireString(calendar.title, `office.rooms.calendars[${index}].title`, errors);
    requireString(calendar.src, `office.rooms.calendars[${index}].src`, errors);
  });
}

function validateLinks(links, pathLabel, errors) {
  requireArray(links, pathLabel, errors);

  (links || []).forEach((link, index) => {
    requireString(link.label, `${pathLabel}[${index}].label`, errors);
    requireString(link.href, `${pathLabel}[${index}].href`, errors);
  });
}

function validateUniqueIds(items, pathLabel, errors) {
  const seen = new Set();

  items.forEach((item, index) => {
    if (!item?.id) {
      return;
    }

    if (seen.has(item.id)) {
      errors.push(`${pathLabel}[${index}].id duplicates "${item.id}"`);
    }

    seen.add(item.id);
  });
}

function requireArray(value, pathLabel, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${pathLabel} must be an array`);
  }
}

function requireObject(value, pathLabel, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${pathLabel} must be an object`);
  }
}

function requireString(value, pathLabel, errors) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${pathLabel} must be a non-empty string`);
  }
}

module.exports = {
  CANONICAL_CONTENT_PATH,
  PUBLIC_CONTENT_PATH,
  formatPortalContent,
  loadPortalContent,
  syncPortalContent,
  validatePortalContent,
  writePortalContent
};
