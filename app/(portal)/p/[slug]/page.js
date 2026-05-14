import { notFound } from "next/navigation";
import { createCustomSectionsHtml } from "@/components/CustomSections";
import { PortalBodyState } from "@/components/PortalBodyState";
import { PortalScripts } from "@/components/PortalScripts";
import { PortalShell } from "@/components/PortalShell";
import portalContent from "@/data/portal-content.json";
import {
  createCustomPageMainHtml,
  createCustomPagePortalConfig,
  getCustomPageBySlug
} from "@/lib/custom-pages";
import { getCustomSectionsForPage } from "@/lib/custom-sections";
import { getPortalPageWithContent } from "@/lib/portal-navigation";

export const dynamic = "force-static";

export function generateStaticParams() {
  return (portalContent.customPages || [])
    .filter((page) => page.active !== false && page.slug)
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getCustomPageBySlug(portalContent, slug);

  return {
    title: page ? `${page.title} | KW Leading Edge Agent Portal` : "KW Leading Edge Agent Portal",
    description: page?.summary || "Keller Williams Leading Edge portal page."
  };
}

export default async function CustomPortalPage({ params }) {
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
    <>
      <PortalBodyState lockLabel={customPage.title} />
      <PortalShell mainHtml={mainHtml} page={page} />
      <PortalScripts />
    </>
  );
}
