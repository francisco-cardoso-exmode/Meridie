import "@/components/al/al.css";
import SubnavAl from "@/components/al/admin/SubnavAl";

// Secção "Alojamento" do backoffice (o painel já valida a sessão de admin).
export default function LayoutAlojamentoAdmin({ children }) {
  return (
    <>
      <SubnavAl />
      {children}
    </>
  );
}
