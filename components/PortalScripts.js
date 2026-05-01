import Script from "next/script";

export function PortalScripts({ includeTockify = false }) {
  return (
    <>
      {includeTockify ? (
        <Script src="https://public.tockify.com/browser/embed.js" strategy="afterInteractive" />
      ) : null}
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
