import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import ProductoForm from "../producto-form";
import { crearProducto } from "@/lib/actions/catalogo";

export default async function NuevoProductoPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  const { data: categoria } = await adminClient
    .from("categories").select("nombre").eq("id", catId).single();
  if (!categoria) notFound();

  async function handleCreate(formData: FormData) {
    "use server";
    return crearProducto(catId, formData);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-1">Nuevo producto</h1>
      <p className="text-sm text-gray-500 mb-6">Categoría: {categoria.nombre}</p>
      <ProductoForm action={handleCreate} backUrl={`/admin/catalogo/${catId}/productos`} />
    </div>
  );
}
