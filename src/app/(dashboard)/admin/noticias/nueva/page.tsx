import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import PostForm from "../post-form";
import { crearPost } from "@/lib/actions/posts";

export default async function NuevaNoticiaPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/inicio");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Nueva noticia</h1>
      <PostForm action={crearPost} />
    </div>
  );
}
