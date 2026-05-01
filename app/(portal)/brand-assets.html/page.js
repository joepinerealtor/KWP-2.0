import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import { createPortalMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = createPortalMetadata({
  title: "KW Leading Edge Marketing + Brand Assets",
  description: "Open Keller Williams Leading Edge marketing tools, brand standards, Canva resources, and logo files in one place.",
  path: "/brand-assets.html"
});

export default function BrandAssetsPage() {
  return (
    <>
      <LegacyPortalPage source="brand-assets.html" pageKey="brandAssets" />
      <PortalScripts />
    </>
  );
}
