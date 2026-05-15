import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import { createPortalMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = createPortalMetadata({
  title: "KW Leading Edge Lone Wolf Transition",
  description: "DocuSign Rooms to Lone Wolf Transact transition resources, training, KW Answers articles, and FAQ for KW Leading Edge agents.",
  path: "/lonewolf/",
  image: "/images/social-preview-lone-wolf-transition.png",
  imageAlt: "DocuSign to Lone Wolf transition information with class registration",
  imageWidth: 1200,
  imageHeight: 630
});

export default function LoneWolfTransitionPage() {
  return (
    <>
      <LegacyPortalPage source="lonewolf/index.html" pageKey="loneWolf" />
      <PortalScripts />
    </>
  );
}
