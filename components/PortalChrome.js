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

function SidebarButtonLink({ link }) {
  return (
    <a className={`button ${link.button || "secondary"} sidebar-button`} {...portalLinkProps(link)}>
      {link.label}
    </a>
  );
}

function SectionNavLink({ link }) {
  const className = classNames(
    "section-nav-link",
    link.active && "is-active",
    link.page && "section-nav-link--page",
    link.primary && "section-nav-link--primary"
  );

  return (
    <a className={className} aria-current={link.active ? "page" : undefined} {...portalLinkProps(link)}>
      {link.label}
    </a>
  );
}

function SiteHeader({ page }) {
  return (
    <div className="site-header">
      <a className="brand-link" href={page.brandHref} aria-label="KW Leading Edge portal home">
        <div className="brand-lockup">
          <img src={page.brandLogo} alt="Keller Williams Realty Leading Edge" className="brand-logo" />
        </div>
        <div className="brand-copy">
          <strong>{page.brandTitle}</strong>
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
        {utility.links.map((link) => (
          <SidebarButtonLink key={link.label} link={link} />
        ))}
      </div>
    );
  }

  return (
    <section className="panel sidebar-utility">
      <p className="eyebrow small">{utility.title}</p>
      <div className="sidebar-link-stack">
        {utility.links.map((link) => (
          <SidebarButtonLink key={link.label} link={link} />
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
        {page.navLinks.map((link) => (
          <SectionNavLink key={`${link.href}-${link.label}`} link={link} />
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
          {page.navLinks.map((link) => (
            <SectionNavLink key={`${link.href}-${link.label}`} link={link} />
          ))}
        </div>
      </details>

      <details className="mobile-menu-panel">
        <summary className="mobile-menu-summary">Quick Links</summary>
        <div className="mobile-menu-links">
          {page.mobileQuickLinks.map((link) => (
            <SidebarButtonLink key={link.label} link={link} />
          ))}
        </div>
      </details>
    </div>
  );
}

function JoeAvailabilityCompact({ statusSrc }) {
  return (
    <div className="content-strip-tech-support" data-joe-availability-card data-joe-availability-src={statusSrc}>
      <div className="joe-availability-panel joe-availability-panel--compact" data-status="unavailable" aria-live="polite">
        <div className="joe-availability-compact-copy">
          <span className="joe-availability-compact-kicker">Tech Help with Joe</span>
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
            href="https://calendly.com/joepinerealtor/tech-meeting-with-joe"
            target="_blank"
            rel="noreferrer"
            data-joe-primary-action
          >
            Schedule an appointment
          </a>
        </div>
      </div>
    </div>
  );
}

export function QuickLinksStrip({ page }) {
  return (
    <section className="content-strip content-strip--sticky panel" aria-label="Daily tools">
      <div className="content-strip-row content-strip-row--links">
        <div className="content-strip-heading content-strip-heading--links">
          <span className="content-strip-kicker">Quick Links</span>
          <strong>Daily Access</strong>
        </div>
        <div className="content-strip-links">
          {dailyAccessLinks.map((link) => (
            <a
              key={link.label}
              className={classNames("content-strip-link", link.primary && "content-strip-link-primary")}
              {...portalLinkProps(link)}
            >
              {link.label}
            </a>
          ))}
        </div>
        {page.showJoeInQuickStrip ? <JoeAvailabilityCompact statusSrc={page.joeStatusSrc} /> : null}
      </div>
    </section>
  );
}

export function PortalFooter({ showLogout }) {
  return (
    <footer className="site-footer">
      <p className="site-footer-item site-footer-item--left">
        &copy; <span id="currentYear">2026</span> Keller Williams Leading Edge
      </p>
      <p className="site-footer-item site-footer-item--center">
        <a href="https://maps.google.com/?q=28+Thurber+Boulevard+Smithfield+RI+02917" target="_blank" rel="noreferrer">
          28 Thurber Boulevard, Smithfield, RI 02917
        </a>
      </p>
      <p className={classNames("site-footer-item site-footer-item--right", showLogout && "site-footer-actions")}>
        <a href="tel:+14013334900">401-333-4900</a>
        {showLogout ? (
          <button className="site-footer-logout" type="button" data-portal-logout>
            Logout
          </button>
        ) : null}
      </p>
    </footer>
  );
}
