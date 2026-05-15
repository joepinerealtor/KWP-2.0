const fallbackSiteUrl = "http://localhost:3000";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
const normalizedSiteUrl = configuredSiteUrl.replace(/\/+$/, "");

export const siteMetadataBase = new URL(normalizedSiteUrl);

export function createPortalMetadata({
  title,
  description,
  path,
  image = "/images/social-preview-login.png",
  imageAlt = "KW Leading Edge Agent Portal login screen",
  imageWidth = 1893,
  imageHeight = 919
}) {
  const url = path || "/";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}
