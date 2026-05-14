export function getCustomSectionsForPage(content = {}, pageKey = "home") {
  const sections = (content.customSections || {})[pageKey];

  return Array.isArray(sections) ? sections.filter(Boolean) : [];
}

export function createCustomSectionId(sections = []) {
  return createUniqueId(sections, "custom-section");
}

export function createCustomSectionCardId(cards = []) {
  return createUniqueId(cards, "custom-card");
}

function createUniqueId(items, prefix) {
  const ids = new Set(items.map((item) => item.id));
  let index = items.length + 1;
  let id = `${prefix}-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `${prefix}-${index}`;
  }

  return id;
}
