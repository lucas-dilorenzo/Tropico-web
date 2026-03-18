import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import MarcarLeido from "./marcar-leido";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("id, titulo, contenido, fotos, video_url, created_at")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const youtubeId = post.video_url ? extractYoutubeId(post.video_url) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <MarcarLeido postId={post.id} />

      <Link
        href="/noticias"
        className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Volver a noticias
      </Link>

      <article>
        <h1 className="text-2xl font-semibold mb-2">{post.titulo}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(post.created_at).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Galería de fotos */}
        {post.fotos?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {post.fotos.map((url: string) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="w-full rounded border object-cover max-h-72"
              />
            ))}
          </div>
        )}

        {/* Contenido */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
          {post.contenido}
        </div>

        {/* Video de YouTube */}
        {youtubeId && (
          <div className="mb-6">
            <div className="relative w-full max-w-xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="absolute inset-0 w-full h-full rounded border"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
