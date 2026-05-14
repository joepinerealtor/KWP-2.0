import { dailyAccessLinks } from "@/lib/portal-config";

function portalLinkProps(link) {
  const props = {
    href: link.href
  };

  if (link.external) {
    props.target = "_blank";
    props.rel = "noreferrer";
  }

  if (link.download) {
    props.download = true;
  }

  return props;
}

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function SidebarButtonLink({ link, editableType = "", editableId = "" }) {
  return (
    <a
      className={`button ${link.button || "secondary"} sidebar-button`}
      data-editable-type={editableType || undefined}
      data-editable-id={editableId || undefined}
      {...portalLinkProps(link)}
    >
      {link.label}
    </a>
  );
}

function SectionNavLink({ link, editableType = "", editableId = "" }) {
  const className = classNames(
    "section-nav-link",
    link.active && "is-active",
    link.page && "section-nav-link--page",
    link.primary && "section-nav-link--primary"
  );

  return (
    <a
      className={className}
      aria-current={link.active ? "page" : undefined}
      data-editable-type={editableType || undefined}
      data-editable-id={editableId || undefined}
      {...portalLinkProps(link)}
    >
      {link.label}
    </a>
  );
}

function SiteHeader({ page }) {
  return (
    <div className="site-header">
      <a
        className="brand-link"
        href={page.brandHref}
        aria-label="KW Leading Edge portal home"
        data-editable-type="site-brand"
        data-editable-id="brand"
      >
        <div className="brand-lockup">
          <img src={page.brandLogo} alt="Keller Williams Realty Leading Edge" className="brand-logo" data-site-brand-logo />
        </div>
        <div className="brand-copy">
          <strong data-site-brand-title>{page.brandTitle}</strong>
        </div>
      </a>

      <div className={page.timeCardClassName || "header-time-card"} aria-label="Current date and time">
        <strong data-header-clock>--:-- ET</strong>
        <span data-header-date>Loading today...</span>
      </div>
    </div>
  );
}

function SidebarUtility({ utility }) {
  if (!utility) {
    return null;
  }

  if (utility.type === "feedback") {
    return (
      <div className="sidebar-utility panel" aria-label={utility.ariaLabel}>
        {utility.links.map((link, index) => (
          <SidebarButtonLink editableType="navigation-utility-link" editableId={String(index)} key={link.label} link={link} />
        ))}
      </div>
    );
  }

  return (
    <section className="panel sidebar-utility">
      <p className="eyebrow small">{utility.title}</p>
      <div className="sidebar-link-stack">
        {utility.links.map((link, index) => (
          <SidebarButtonLink editableType="navigation-utility-link" editableId={String(index)} key={link.label} link={link} />
        ))}
      </div>
    </section>
  );
}

export function PortalSidebar({ page }) {
  return (
    <aside className="portal-sidebar">
      <SiteHeader page={page} />

      <nav className="section-nav panel" aria-label={page.navLabel}>
        {page.navLinks.map((link, index) => (
          <SectionNavLink editableType="navigation-link" editableId={String(index)} key={`${link.href}-${link.label}`} link={link} />
        ))}
      </nav>

      <SidebarUtility utility={page.sidebarUtility} />
    </aside>
  );
}

export function MobileSidebarMenus({ page }) {
  return (
    <div className="mobile-sidebar-menus" aria-label={page.mobileMenusLabel}>
      <details className="mobile-menu-panel">
        <summary className="mobile-menu-summary">Menu</summary>
        <div className="mobile-menu-links">
          {page.navLinks.map((link, index) => (
            <SectionNavLink editableType="navigation-link" editableId={String(index)} key={`${link.href}-${link.label}`} link={link} />
          ))}
        </div>
      </details>

      <details className="mobile-menu-panel">
        <summary className="mobile-menu-summary">Quick Links</summary>
        <div className="mobile-menu-links">
          {page.mobileQuickLinks.map((link, index) => (
            <SidebarButtonLink editableType="navigation-mobile-link" editableId={String(index)} key={link.label} link={link} />
          ))}
        </div>
      </details>
    </div>
  );
}

function JoeAvailabilityCompact({ statusSrc, joeSupport }) {
  return (
    <div
      className="content-strip-tech-support"
      data-editable-type="joe-availability-card"
      data-editable-id="joeAvailability"
      data-joe-availability-card
      data-joe-availability-src={statusSrc}
    >
      <div className="joe-availability-panel joe-availability-panel--compact" data-status="unavailable" aria-live="polite">
        <div className="joe-availability-compact-copy">
          <span className="joe-availability-compact-kicker">{joeSupport.eyebrow || "Tech Help with Joe"}</span>
          <div className="joe-availability-compact-status">
            <span className="joe-availability-light" data-joe-availability-light aria-hidden="true" />
            <div className="joe-availability-copy">
              <p className="joe-availability-label" data-joe-availability-label>Joe is unavailable</p>
              <p className="joe-availability-summary" data-joe-availability-summary>No open tech-help slots are listed right now.</p>
            </div>
          </div>
        </div>
        <div className="joe-availability-actions joe-availability-actions--compact">
          <a
            className="content-strip-tech-button"
            href={joeSupport.buttonHref}
            target="_blank"
            rel="noreferrer"
            data-joe-primary-action
          >
            {joeSupport.buttonLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export function QuickLinksStrip({ page }) {
  const links = page.dailyAccessLinks || dailyAccessLinks;

  return (
    <section className="content-strip content-strip--sticky panel" aria-label="Daily tools">
      <div className="content-strip-row content-strip-row--links">
        <div className="content-strip-heading content-strip-heading--links">
          <span className="content-strip-kicker">Quick Links</span>
          <strong>Daily Access</strong>
        </div>
        <div className="content-strip-links">
          {links.map((link, index) => (
            <a
              key={link.label}
              className={classNames("content-strip-link", link.primary && "content-strip-link-primary")}
              data-editable-type="navigation-daily-link"
              data-editable-id={String(index)}
              {...portalLinkProps(link)}
            >
              {link.label}
            </a>
          ))}
        </div>
        {page.showJoeInQuickStrip ? <JoeAvailabilityCompact joeSupport={page.leadershipSupport || {}} statusSrc={page.joeStatusSrc} /> : null}
      </div>
    </section>
  );
}

export function PortalFooter({ page }) {
  const footer = page.footer || {};
  const showLogout = page.showLogout;

  return (
    <footer className="site-footer" data-editable-type="site-footer" data-editable-id="footer">
      <p className="site-footer-item site-footer-item--left" data-editable-type="site-footer-field" data-editable-id="copyright">
        {footer.copyright || "© 2026 Keller Williams Leading Edge"}
      </p>
      <p className="site-footer-item site-footer-item--center">
        <a
          href={footer.addressHref || "#"}
          target="_blank"
          rel="noreferrer"
          data-editable-type="site-footer-field"
          data-editable-id="address"
        >
          {footer.addressLabel || ""}
        </a>
      </p>
      <p className={classNames("site-footer-item site-footer-item--right", showLogout && "site-footer-actions")}>
        <a href={footer.phoneHref || "#"} data-editable-type="site-footer-field" data-editable-id="phone">{footer.phoneLabel || ""}</a>
        {showLogout ? (
          <>
            <a className="site-footer-admin" href="/admin/visual/">
              Admin
            </a>
            <button className="site-footer-logout" type="button" data-portal-logout>
              Logout
            </button>
          </>
        ) : null}
      </p>
    </footer>
  );
}
