import "../../admin-content.css";

export const metadata = {
  title: "KWP Content Admin"
};

export const viewport = {
  themeColor: "#111111"
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="admin-body">{children}</body>
    </html>
  );
}
