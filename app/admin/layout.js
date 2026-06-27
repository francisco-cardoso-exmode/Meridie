export const metadata = {
  title: { default: "Backoffice", template: "%s · Backoffice" },
  robots: { index: false, follow: false },
};

// O wrapper .admin-page serve de gancho para esconder o Header/Footer públicos.
export default function AdminLayout({ children }) {
  return <div className="admin-page">{children}</div>;
}
