function toPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";
}

function getActiveVendors(vendors, section) {
  return vendors.filter((vendor) => vendor.active !== false && vendor.section === section);
}

export function VendorGrid({ vendors = [], section, featured = false }) {
  const activeVendors = getActiveVendors(vendors, section);

  return (
    <div
      className={`vendor-grid${featured ? " vendor-grid-featured" : ""}`}
      data-vendor-grid={section}
      data-react-rendered="true"
      aria-live="polite"
    >
      {activeVendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}

function VendorCard({ vendor }) {
  const phoneHref = toPhoneHref(vendor.phone);

  return (
    <article className={`vendor-card${vendor.section === "core" ? " vendor-card-featured" : ""}`}>
      <div className="vendor-brand">
        <img className="vendor-logo" src={vendor.logo} alt={`${vendor.business || vendor.name} logo`} />
      </div>
      <dl className="vendor-details">
        <div><dt>Business</dt><dd>{vendor.business || ""}</dd></div>
        <div><dt>Name</dt><dd>{vendor.name || ""}</dd></div>
        <div>
          <dt>Phone</dt>
          <dd>{vendor.phone && phoneHref ? <a href={phoneHref}>{vendor.phone}</a> : vendor.phone || ""}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{vendor.email ? <a href={`mailto:${vendor.email}`}>{vendor.email}</a> : ""}</dd>
        </div>
        <div><dt>Notes</dt><dd>{vendor.notes || ""}</dd></div>
      </dl>
    </article>
  );
}

export function createVendorGridHtml(vendors = [], section, { featured = false } = {}) {
  const vendorCards = getActiveVendors(vendors, section)
    .map(createVendorCardHtml)
    .join("");

  return `<div class="vendor-grid${featured ? " vendor-grid-featured" : ""}" data-vendor-grid="${escapeHtmlAttribute(section)}" data-react-rendered="true" aria-live="polite">${vendorCards}</div>`;
}

function createVendorCardHtml(vendor) {
  const phoneHref = toPhoneHref(vendor.phone);
  const phone = vendor.phone && phoneHref
    ? `<a href="${phoneHref}">${escapeHtml(vendor.phone)}</a>`
    : escapeHtml(vendor.phone || "");
  const email = vendor.email
    ? `<a href="mailto:${escapeHtmlAttribute(vendor.email)}">${escapeHtml(vendor.email)}</a>`
    : "";
  const featuredClass = vendor.section === "core" ? " vendor-card-featured" : "";

  return `<article class="vendor-card${featuredClass}"><div class="vendor-brand"><img class="vendor-logo" src="${escapeHtmlAttribute(vendor.logo)}" alt="${escapeHtmlAttribute(vendor.business || vendor.name)} logo"></div><dl class="vendor-details"><div><dt>Business</dt><dd>${escapeHtml(vendor.business || "")}</dd></div><div><dt>Name</dt><dd>${escapeHtml(vendor.name || "")}</dd></div><div><dt>Phone</dt><dd>${phone}</dd></div><div><dt>E-mail</dt><dd>${email}</dd></div><div><dt>Notes</dt><dd>${escapeHtml(vendor.notes || "")}</dd></div></dl></article>`;
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
