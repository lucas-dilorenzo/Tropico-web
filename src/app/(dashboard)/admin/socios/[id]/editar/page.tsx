import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import SocioForm from "../../socio-form";
import { editarSocio } from "@/lib/actions/socios";

export default async function EditarSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: socio } = await adminClient
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!socio) notFound();

  const { data: adminData } = await adminClient
    .from("users_admin_data")
    .select("*")
    .eq("user_id", id)
    .single();

  const defaultValues = {
    email: socio.email,
    nombre: socio.nombre || "",
    apellido: socio.apellido || "",
    dni: socio.dni || "",
    numero_socio: socio.numero_socio || "",
    telefono: socio.telefono || "",
    fecha_ingreso: socio.fecha_ingreso || "",
    estado: socio.estado || "",
    activo: socio.activo,
    notas: adminData?.notas || "",
    numero_tramite: adminData?.numero_tramite || "",
    diagnostico: adminData?.diagnostico || "",
    codigo_vinculacion: adminData?.codigo_vinculacion || "",
    fecha_vinculacion: adminData?.fecha_vinculacion || "",
    medico: adminData?.medico || "",
    observaciones: adminData?.observaciones || "",
  };

  async function handleEdit(formData: FormData) {
    "use server";
    return editarSocio(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Socio</h1>
      <SocioForm action={handleEdit} defaultValues={defaultValues} isEdit />
    </div>
  );
}
