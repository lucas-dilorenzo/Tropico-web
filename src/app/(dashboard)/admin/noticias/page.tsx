import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import EliminarPost from "./eliminar-post";

export default async function AdminNoticiasPage() {
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

  const { data: posts } = await adminClient
    .from("posts")
    .select("id, titulo, fotos, video_url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Noticias</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/noticias"
            className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 text-gray-600"
          >
            Vista previa
          </Link>
          <Link
            href="/admin/noticias/nueva"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            + Nueva noticia
          </Link>
        </div>
      </div>

      {!posts?.length ? (
        <p className="text-gray-500 text-sm">No hay noticias publicadas.</p>
      ) : (
        <div className="bg-white rounded border divide-y">
          {posts.map((post) => (
            <div key={post.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{post.titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(post.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {post.fotos?.length
                    ? ` · ${post.fotos.length} foto${post.fotos.length !== 1 ? "s" : ""}`
                    : ""}
                  {post.video_url ? " · Video" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/noticias/${post.id}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Preview
                </Link>
                <Link
                  href={`/admin/noticias/${post.id}/editar`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Editar
                </Link>
                <EliminarPost postId={post.id} titulo={post.titulo} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
