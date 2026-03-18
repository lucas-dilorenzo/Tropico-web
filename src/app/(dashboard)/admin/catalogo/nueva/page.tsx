import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import CategoriaForm from "../categoria-form";
import { crearCategoria } from "@/lib/actions/catalogo";

export default async function NuevaCategoriaPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Nueva categoría</h1>
      <CategoriaForm action={crearCategoria} />
    </div>
  );
}
