import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import PostForm from "../../post-form";
import { editarPost } from "@/lib/actions/posts";

export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: post } = await adminClient
    .from("posts")
    .select("id, titulo, contenido, fotos, video_url")
    .eq("id", id)
    .single();

  if (!post) notFound();

  async function handleEdit(formData: FormData) {
    "use server";
    return editarPost(id, formData);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Editar noticia</h1>
      <PostForm action={handleEdit} post={post} />
    </div>
  );
}
