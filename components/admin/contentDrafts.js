export function validateCourseDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((course, index) => {
    const label = `Course ${index + 1}`;

    ["id", "tag", "title", "summary", "href"].forEach((field) => {
      if (!String(course[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(course.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Course ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }
  });

  return errors;
}

export function validateVendorDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((vendor, index) => {
    const label = `Vendor ${index + 1}`;

    ["id", "section", "business", "logo", "name", "notes"].forEach((field) => {
      if (!String(vendor[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(vendor.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Vendor ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }
  });

  return errors;
}

export function validateLeadershipDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((person, index) => {
    const label = `Leader ${index + 1}`;

    ["id", "group", "role", "name", "photo"].forEach((field) => {
      if (!String(person[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(person.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Leader ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }
  });

  return errors;
}

export function validateMarketingToolDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((tool, index) => {
    const label = `Marketing Tool ${index + 1}`;

    ["id", "kicker", "title", "summary"].forEach((field) => {
      if (!String(tool[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(tool.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Marketing Tool ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }

    validateLinkList(tool.links, `${label} Link`, errors);
  });

  return errors;
}

export function validateDigitalLogoDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((logo, index) => {
    const label = `Digital Logo ${index + 1}`;

    ["id", "kicker", "title", "summary", "previewClass"].forEach((field) => {
      if (!String(logo[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(logo.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Digital Logo ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }

    if (!logo.image || typeof logo.image !== "object" || Array.isArray(logo.image)) {
      errors.push(`${label}: image must be set.`);
    } else {
      ["src", "alt"].forEach((field) => {
        if (!String(logo.image[field] || "").trim()) {
          errors.push(`${label}: image ${field} is required.`);
        }
      });
    }

    validateLinkList(logo.links, `${label} Link`, errors);
  });

  return errors;
}

export function validateSourceFileDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((file, index) => {
    const label = `Source File ${index + 1}`;

    ["id", "kicker", "title"].forEach((field) => {
      if (!String(file[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(file.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Source File ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }

    validateLinkList(file.links, `${label} Link`, errors);
  });

  return errors;
}

export function validateOfficeCardDraft(card, label) {
  const errors = [];

  ["tag", "title", "summary"].forEach((field) => {
    if (!String(card[field] || "").trim()) {
      errors.push(`${label}: ${field} is required.`);
    }
  });

  if (!Array.isArray(card.chips)) {
    errors.push(`${label}: chips must be a list.`);
    return errors;
  }

  card.chips.forEach((chip, index) => {
    if (!String(chip.label || "").trim()) {
      errors.push(`${label} Chip ${index + 1}: label is required.`);
    }
  });

  if (card.action) {
    if (!String(card.action.label || "").trim()) {
      errors.push(`${label}: action label is required.`);
    }

    if (!String(card.action.href || "").trim()) {
      errors.push(`${label}: action href is required.`);
    }
  }

  return errors;
}

export function validateOfficeOperationsDraft(operations) {
  const errors = [];

  ["tag", "title", "hoursLabel", "holidaysLabel"].forEach((field) => {
    if (!String(operations[field] || "").trim()) {
      errors.push(`Office Operations: ${field} is required.`);
    }
  });

  if (!Array.isArray(operations.hours)) {
    errors.push("Office Operations: hours must be a list.");
  } else {
    operations.hours.forEach((hour, index) => {
      ["days", "time"].forEach((field) => {
        if (!String(hour[field] || "").trim()) {
          errors.push(`Office Operations Hours ${index + 1}: ${field} is required.`);
        }
      });
    });
  }

  if (!Array.isArray(operations.holidays)) {
    errors.push("Office Operations: holidays must be a list.");
  } else {
    operations.holidays.forEach((holiday, index) => {
      if (!String(holiday || "").trim()) {
        errors.push(`Office Operations Holiday ${index + 1}: holiday is required.`);
      }
    });
  }

  return errors;
}

export function validateRoomsDraft(rooms) {
  const errors = [];

  if (!String(rooms.summary || "").trim()) {
    errors.push("Rooms: summary is required.");
  }

  if (!Array.isArray(rooms.actions)) {
    errors.push("Rooms: actions must be a list.");
  } else {
    rooms.actions.forEach((action, index) => {
      ["label", "url"].forEach((field) => {
        if (!String(action[field] || "").trim()) {
          errors.push(`Rooms Action ${index + 1}: ${field} is required.`);
        }
      });
    });
  }

  if (!Array.isArray(rooms.calendars)) {
    errors.push("Rooms: calendars must be a list.");
  } else {
    rooms.calendars.forEach((calendar, index) => {
      ["label", "title", "src"].forEach((field) => {
        if (!String(calendar[field] || "").trim()) {
          errors.push(`Rooms Calendar ${index + 1}: ${field} is required.`);
        }
      });
    });
  }

  return errors;
}

export function createCourseId(courses) {
  return createDraftId(courses, "new-course");
}

export function createVendorId(vendors) {
  return createDraftId(vendors, "new-vendor");
}

export function createLeadershipId(leaders) {
  return createDraftId(leaders, "new-leader");
}

export function createMarketingToolId(tools) {
  return createDraftId(tools, "new-marketing-tool");
}

export function createDigitalLogoId(logos) {
  return createDraftId(logos, "new-digital-logo");
}

export function createSourceFileId(files) {
  return createDraftId(files, "new-source-file");
}

function validateLinkList(links, labelPrefix, errors) {
  if (!Array.isArray(links)) {
    errors.push(`${labelPrefix.replace(/ Link$/, "")}: links must be a list.`);
    return;
  }

  links.forEach((link, linkIndex) => {
    const linkLabel = `${labelPrefix} ${linkIndex + 1}`;

    ["label", "href"].forEach((field) => {
      if (!String(link[field] || "").trim()) {
        errors.push(`${linkLabel}: ${field} is required.`);
      }
    });
  });
}

function createDraftId(items, prefix) {
  const ids = new Set(items.map((item) => item.id));
  let index = items.length + 1;
  let id = `${prefix}-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `${prefix}-${index}`;
  }

  return id;
}
