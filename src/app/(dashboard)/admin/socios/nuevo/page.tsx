import SocioForm from "../socio-form";
import { crearSocio } from "@/lib/actions/socios";

export default function NuevoSocioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Socio</h1>
      <SocioForm action={crearSocio} />
    </div>
  );
}
