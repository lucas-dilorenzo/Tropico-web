import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import ProductoForm from "../../producto-form";
import { editarProducto } from "@/lib/actions/catalogo";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ catId: string; prodId: string }>;
}) {
  const { catId, prodId } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  const { data: producto } = await adminClient
    .from("products")
    .select("id, nombre, descripcion, fotos")
    .eq("id", prodId)
    .single();

  if (!producto) notFound();

  async function handleEdit(formData: FormData) {
    "use server";
    return editarProducto(prodId, formData);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Editar producto</h1>
      <ProductoForm
        action={handleEdit}
        producto={producto}
        backUrl={`/admin/catalogo/${catId}/productos`}
      />
    </div>
  );
}
