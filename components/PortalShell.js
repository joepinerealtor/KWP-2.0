import {
  MobileSidebarMenus,
  PortalFooter,
  PortalSidebar,
  QuickLinksStrip
} from "@/components/PortalChrome";

export function TopRail() {
  return <div className="top-rail" aria-hidden="true" />;
}

export function PortalShell({ mainHtml, overlaysHtml = "", page }) {
  return (
    <>
      <TopRail />
      <div className="site-shell">
        <div className="portal-frame">
          <PortalSidebar page={page} />
          <MobileSidebarMenus page={page} />

          <div className="portal-content">
            <QuickLinksStrip page={page} />
            <main className="page-content" dangerouslySetInnerHTML={{ __html: mainHtml }} />
            <PortalFooter showLogout={page.showLogout} />
          </div>
        </div>
      </div>
      {overlaysHtml ? (
        <div data-portal-overlays dangerouslySetInnerHTML={{ __html: overlaysHtml }} />
      ) : null}
    </>
  );
}
