export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeHtmlAttribute(value = "") {
  return escapeHtml(value);
}

export function toPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";
}

export function createLinkAttributes(link = {}, extraAttributes = []) {
  const attrs = [`href="${escapeHtmlAttribute(link.href)}"`];

  if (link.external) {
    attrs.push('target="_blank"', 'rel="noreferrer"');
  }

  if (link.download) {
    attrs.push("download");
  }

  attrs.push(...extraAttributes);

  return attrs.join(" ");
}
