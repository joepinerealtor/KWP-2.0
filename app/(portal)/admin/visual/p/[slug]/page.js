import { notFound } from "next/navigation";
import { createCustomSectionsHtml } from "@/components/CustomSections";
import { PortalBodyState } from "@/components/PortalBodyState";
import { PortalScripts } from "@/components/PortalScripts";
import { PortalShell } from "@/components/PortalShell";
import { VisualEditorOverlay } from "@/components/admin/VisualEditorOverlay";
import portalContent from "@/data/portal-content.json";
import {
  createCustomPageMainHtml,
  createCustomPagePortalConfig,
  getCustomPageBySlug
} from "@/lib/custom-pages";
import { getCustomSectionsForPage } from "@/lib/custom-sections";
import { getPortalPageWithContent } from "@/lib/portal-navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "KWP Visual Editor - Custom Page"
};

export default async function CustomVisualAdminPage({ params }) {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    notFound();
  }

  const { slug } = await params;
  const customPage = getCustomPageBySlug(portalContent, slug);

  if (!customPage) {
    notFound();
  }

  const customSections = getCustomSectionsForPage(portalContent, customPage.id);
  const pageConfig = createCustomPagePortalConfig({
    ...customPage,
    sections: customSections
  });
  const page = getPortalPageWithContent(customPage.id, pageConfig, portalContent);
  const mainHtml = createCustomPageMainHtml(customPage, createCustomSectionsHtml(customSections));

  return (
    <div className="visual-editor-mode">
      <PortalBodyState lockLabel={customPage.title} />
      <PortalShell mainHtml={mainHtml} page={page} />
      <VisualEditorOverlay
        currentEditorPage={customPage.id}
        initialContent={portalContent}
        initialSectionId="pages"
        previewHref={`/p/${customPage.slug}/`}
      />
      <PortalScripts />
    </div>
  );
}
