import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import CategoriaForm from "../../categoria-form";
import { editarCategoria } from "@/lib/actions/catalogo";

export default async function EditarCategoriaPage({
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
    .from("categories")
    .select("id, nombre, descripcion, orden, imagen")
    .eq("id", catId)
    .single();

  if (!categoria) notFound();

  async function handleEdit(formData: FormData) {
    "use server";
    return editarCategoria(catId, formData);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Editar categoría</h1>
      <CategoriaForm action={handleEdit} categoria={categoria} />
    </div>
  );
}
