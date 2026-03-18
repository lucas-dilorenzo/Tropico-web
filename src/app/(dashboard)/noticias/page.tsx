import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NoticiasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: posts }, { data: reads }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, titulo, contenido, fotos, video_url, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("post_reads")
      .select("post_id")
      .eq("user_id", user.id),
  ]);

  const leidos = new Set((reads ?? []).map((r) => r.post_id));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Noticias</h1>

      {!posts?.length ? (
        <p className="text-gray-500 text-sm">No hay noticias publicadas todavía.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const esNuevo = !leidos.has(post.id);
            const excerpt =
              post.contenido.length > 160
                ? post.contenido.slice(0, 160) + "..."
                : post.contenido;

            return (
              <Link key={post.id} href={`/noticias/${post.id}`} className="block group">
                <div className="bg-white rounded border p-4 group-hover:border-blue-300 group-hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-medium text-sm truncate">{post.titulo}</h2>
                        {esNuevo && (
                          <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {post.fotos?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.fotos[0]}
                        alt=""
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
