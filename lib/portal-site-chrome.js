const DEFAULT_FOOTER = {
  copyright: "© 2026 Keller Williams Leading Edge",
  addressLabel: "28 Thurber Boulevard, Smithfield, RI 02917",
  addressHref: "https://maps.google.com/?q=28+Thurber+Boulevard+Smithfield+RI+02917",
  phoneLabel: "401-333-4900",
  phoneHref: "tel:+14013334900"
};

export function getSiteChromeContent(content = {}, pageKey, page) {
  const siteChrome = content.siteChrome || {};
  const pageChrome = siteChrome.pages?.[pageKey] || {};

  return {
    brandHref: pageChrome.brandHref || page.brandHref,
    brandLogo: pageChrome.brandLogo || page.brandLogo,
    brandTitle: pageChrome.brandTitle || page.brandTitle,
    footer: {
      ...DEFAULT_FOOTER,
      ...(siteChrome.footer || {})
    }
  };
}

export function mergePageWithSiteChrome(content = {}, pageKey, page) {
  const siteChrome = getSiteChromeContent(content, pageKey, page);

  return {
    ...page,
    brandHref: siteChrome.brandHref,
    brandLogo: siteChrome.brandLogo,
    brandTitle: siteChrome.brandTitle,
    footer: siteChrome.footer
  };
}
