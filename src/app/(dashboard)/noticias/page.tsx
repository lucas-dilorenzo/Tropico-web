import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function NoticiasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: posts, error: postsError }, { data: reads }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, titulo, contenido, fotos, video_url, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("post_reads")
      .select("post_id")
      .eq("user_id", user.id),
  ]);

  if (postsError) console.error("[noticias] error fetching posts:", postsError);

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  const leidos = new Set((reads ?? []).map((r) => r.post_id));

  const backButton = isAdmin && (
    <Link
      href="/admin/noticias"
      className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
    >
      ← Volver al panel
    </Link>
  );

  if (!posts?.length) {
    return (
      <div className="max-w-3xl mx-auto">
        {backButton}
        <h1 className="text-xl font-semibold mb-6">Noticias</h1>
        <p className="text-gray-500 text-sm">No hay noticias publicadas todavía.</p>
      </div>
    );
  }

  const [destacada, ...resto] = posts;

  return (
    <div className="max-w-3xl mx-auto">
      {backButton}
      <h1 className="text-xl font-semibold mb-6">Noticias</h1>

      {/* Noticia destacada (la más reciente) */}
      <Link href={`/noticias/${destacada.id}`} className="block group mb-6">
        <div className="bg-white rounded-lg border overflow-hidden group-hover:shadow-md group-hover:border-blue-300 transition-all">
          {destacada.fotos?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={destacada.fotos[0]}
              alt=""
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-semibold text-lg leading-snug">{destacada.titulo}</h2>
              {!leidos.has(destacada.id) && (
                <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                  Nuevo
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
              {destacada.contenido}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>
                {new Date(destacada.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {destacada.fotos?.length > 1 && (
                <span>· {destacada.fotos.length} fotos</span>
              )}
              {destacada.video_url && <span>· Video</span>}
            </div>
          </div>
        </div>
      </Link>

      {/* Resto de noticias */}
      {resto.length > 0 && (
        <div className="space-y-3">
          {resto.map((post) => {
            const esNuevo = !leidos.has(post.id);
            return (
              <Link key={post.id} href={`/noticias/${post.id}`} className="block group">
                <div className="bg-white rounded-lg border overflow-hidden group-hover:shadow-sm group-hover:border-blue-300 transition-all">
                  <div className="flex gap-4 p-4">
                    {post.fotos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.fotos[0]}
                        alt=""
                        className="w-24 h-24 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-300 text-2xl">
                        📰
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="font-medium text-sm leading-snug">{post.titulo}</h2>
                        {esNuevo && (
                          <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.contenido}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>
                          {new Date(post.created_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {post.fotos?.length > 1 && <span>· {post.fotos.length} fotos</span>}
                        {post.video_url && <span>· Video</span>}
                      </div>
                    </div>
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
