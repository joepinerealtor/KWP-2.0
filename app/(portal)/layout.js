import "../../styles.css";
import { siteMetadataBase } from "@/lib/metadata";

export const metadata = {
  metadataBase: siteMetadataBase,
  applicationName: "KW Leading Edge Agent Portal"
};

export const viewport = {
  themeColor: "#b40101"
};

export default function PortalLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/kw-app-11%20favicon%20app.png" />
        <link rel="shortcut icon" href="/kw-app-11%20favicon%20app.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Condensed:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="portal-protected" data-portal-lock-label="Agent Portal">
        {children}
      </body>
    </html>
  );
}
