import AdminNav from "@/components/admin/AdminNav";

export default function PainelLayout({ children }) {
  return (
    <>
      <AdminNav />
      <main className="admin-main">{children}</main>
    </>
  );
}
