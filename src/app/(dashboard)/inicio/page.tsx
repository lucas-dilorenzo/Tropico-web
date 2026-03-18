import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function InicioPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("nombre, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (isAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">
          Bienvenido{profile?.nombre ? `, ${profile.nombre}` : ""}
        </h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Link
            href="/admin/socios"
            className="bg-white border rounded-lg p-5 hover:shadow-sm hover:border-blue-300 transition-all"
          >
            <p className="text-2xl mb-2">👥</p>
            <p className="font-medium text-sm">Socios</p>
            <p className="text-xs text-gray-500 mt-0.5">Gestionar socios</p>
          </Link>
          <Link
            href="/admin/noticias"
            className="bg-white border rounded-lg p-5 hover:shadow-sm hover:border-blue-300 transition-all"
          >
            <p className="text-2xl mb-2">📰</p>
            <p className="font-medium text-sm">Noticias</p>
            <p className="text-xs text-gray-500 mt-0.5">Publicar contenido</p>
          </Link>
          <div className="bg-white border rounded-lg p-5 opacity-50 cursor-not-allowed">
            <p className="text-2xl mb-2">🛒</p>
            <p className="font-medium text-sm">Catálogo</p>
            <p className="text-xs text-gray-500 mt-0.5">Próximamente</p>
          </div>
        </div>
      </div>
    );
  }

  const [{ data: posts }, { data: reads }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, titulo, contenido, fotos, video_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("post_reads")
      .select("post_id")
      .eq("user_id", user.id),
  ]);

  const leidos = new Set((reads ?? []).map((r) => r.post_id));
  const noLeidos = (posts ?? []).filter((p) => !leidos.has(p.id)).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Bienvenido</h1>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Últimas noticias</h2>
            {noLeidos > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {noLeidos} nueva{noLeidos !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <Link href="/noticias" className="text-sm text-blue-600 hover:text-blue-800">
            Ver todas →
          </Link>
        </div>

        {!posts?.length ? (
          <p className="text-gray-500 text-sm">No hay noticias publicadas todavía.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
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
                          className="w-20 h-20 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-300 text-xl">
                          📰
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-sm leading-snug">{post.titulo}</h3>
                          {esNuevo && (
                            <span className="flex-shrink-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.contenido}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
