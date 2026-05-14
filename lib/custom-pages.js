import { dailyAccessLinks } from "@/lib/portal-config";

const DEFAULT_CUSTOM_PAGE = {
  id: "",
  slug: "",
  title: "New Page",
  summary: "Add sections and cards to build this page.",
  active: true
};

export function getCustomPages(content = {}) {
  return Array.isArray(content.customPages) ? content.customPages : [];
}

export function getCustomPageById(content = {}, pageId) {
  return getCustomPages(content).find((page) => page.id === pageId) || null;
}

export function getCustomPageBySlug(content = {}, slug) {
  return getCustomPages(content).find((page) => page.slug === slug && page.active !== false) || null;
}

export function createCustomPageDraft(title, existingPages = []) {
  const baseTitle = String(title || "New Page").trim() || "New Page";
  const slug = createUniquePageSlug(baseTitle, existingPages);

  return {
    ...DEFAULT_CUSTOM_PAGE,
    id: `page-${slug}`,
    slug,
    title: baseTitle
  };
}

export function duplicateCustomPageDraft(page, existingPages = []) {
  const nextTitle = `${page.title || "Page"} Copy`;
  const slug = createUniquePageSlug(nextTitle, existingPages);

  return {
    ...DEFAULT_CUSTOM_PAGE,
    ...page,
    id: `page-${slug}`,
    slug,
    title: nextTitle,
    active: true
  };
}

export function createUniquePageSlug(title, existingPages = []) {
  const existingSlugs = new Set(existingPages.map((page) => page.slug));
  const baseSlug = slugifyPageTitle(title) || "new-page";
  let slug = baseSlug;
  let index = 2;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

export function slugifyPageTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function createCustomPagePortalConfig(page) {
  const visibleSections = Array.isArray(page.sections) ? page.sections : [];

  return {
    lockLabel: page.title,
    brandHref: "/",
    brandLogo: "/brand/kw-leading-edge-logo.png",
    brandTitle: page.title,
    timeCardClassName: "header-time-card header-time-card--sidebar",
    navLabel: `${page.title} sections`,
    mobileMenusLabel: "Mobile portal menus",
    navLinks: [
      { label: "Home", href: "/", page: true },
      ...visibleSections.map((section) => ({
        label: section.title || section.id,
        href: `#${section.id}`
      }))
    ],
    sidebarUtility: {
      type: "stack",
      title: "Quick Links",
      links: dailyAccessLinks.map((link) => ({
        ...link,
        button: link.primary ? "primary" : "secondary"
      }))
    },
    mobileQuickLinks: dailyAccessLinks.map((link) => ({
      ...link,
      button: link.primary ? "primary" : "secondary"
    })),
    showLogout: true
  };
}

export function createCustomPageMainHtml(page, sectionsHtml) {
  return `<section class="panel directory-panel" id="custom-page-${page.slug}">
            <div class="directory-head">
              <div class="directory-title-block">
                <p class="eyebrow small" data-editable-type="custom-page-heading" data-editable-id="${page.id}:eyebrow">Custom Page</p>
                <h1 data-editable-type="custom-page-heading" data-editable-id="${page.id}:title">${escapeHtml(page.title)}</h1>
                <p class="dashboard-summary" data-editable-type="custom-page-heading" data-editable-id="${page.id}:summary">${escapeHtml(page.summary || "")}</p>
              </div>
            </div>
          </section>
          ${sectionsHtml}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
