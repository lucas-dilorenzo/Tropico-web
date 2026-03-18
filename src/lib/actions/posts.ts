"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

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

async function verificarAdmin() {
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

  return { user, adminClient };
}

async function subirFotos(adminClient: ReturnType<typeof createAdminClient>, archivos: File[]): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  for (const archivo of archivos) {
    if (archivo.size === 0) continue;
    const ext = archivo.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await adminClient.storage
      .from("posts")
      .upload(fileName, archivo);

    if (uploadError) return { urls: [], error: `Error subiendo foto: ${uploadError.message}` };

    const { data: urlData } = adminClient.storage.from("posts").getPublicUrl(fileName);
    urls.push(urlData.publicUrl);
  }
  return { urls };
}

export async function crearPost(formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const titulo = (formData.get("titulo") as string)?.trim();
  const contenido = (formData.get("contenido") as string)?.trim();
  const video_url = (formData.get("video_url") as string)?.trim() || null;
  const archivos = formData.getAll("fotos") as File[];

  if (!titulo) return { error: "El título es obligatorio" };
  if (!contenido) return { error: "El contenido es obligatorio" };
  if (titulo.length > 200) return { error: "El título no puede superar 200 caracteres" };
  if (video_url && !extractYoutubeId(video_url)) return { error: "La URL de YouTube no es válida" };

  const { urls: fotoUrls, error: uploadError } = await subirFotos(adminClient, archivos);
  if (uploadError) return { error: uploadError };

  const { error } = await adminClient
    .from("posts")
    .insert({ titulo, contenido, fotos: fotoUrls, video_url });

  if (error) return { error: `Error creando noticia: ${error.message}` };

  return { success: true };
}

export async function editarPost(postId: string, formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const titulo = (formData.get("titulo") as string)?.trim();
  const contenido = (formData.get("contenido") as string)?.trim();
  const video_url = (formData.get("video_url") as string)?.trim() || null;
  const archivos = formData.getAll("fotos") as File[];
  const fotosExistentesJson = formData.get("fotos_existentes") as string;

  if (!titulo) return { error: "El título es obligatorio" };
  if (!contenido) return { error: "El contenido es obligatorio" };
  if (titulo.length > 200) return { error: "El título no puede superar 200 caracteres" };
  if (video_url && !extractYoutubeId(video_url)) return { error: "La URL de YouTube no es válida" };

  let fotoUrls: string[] = [];
  try {
    fotoUrls = JSON.parse(fotosExistentesJson || "[]");
  } catch { /* mantener array vacío */ }

  const { urls: nuevasUrls, error: uploadError } = await subirFotos(adminClient, archivos);
  if (uploadError) return { error: uploadError };
  fotoUrls = [...fotoUrls, ...nuevasUrls];

  const { error } = await adminClient
    .from("posts")
    .update({ titulo, contenido, fotos: fotoUrls, video_url })
    .eq("id", postId);

  if (error) return { error: `Error actualizando noticia: ${error.message}` };

  return { success: true };
}

export async function eliminarPost(postId: string) {
  const { adminClient } = await verificarAdmin();

  const { error } = await adminClient
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) return { error: error.message };

  return { success: true };
}

export async function marcarLeido(postId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("post_reads")
    .upsert({ user_id: user.id, post_id: postId }, { onConflict: "user_id,post_id" });

  if (error) return { error: error.message };

  return { success: true };
}
