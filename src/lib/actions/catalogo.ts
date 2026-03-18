"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

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

  return { adminClient };
}

async function subirImagen(
  adminClient: ReturnType<typeof createAdminClient>,
  archivo: File | null,
  prefijo: string
): Promise<{ url: string | null; error?: string }> {
  if (!archivo || archivo.size === 0) return { url: null };
  const ext = archivo.name.split(".").pop();
  const fileName = `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await adminClient.storage.from("catalogo").upload(fileName, archivo);
  if (error) return { url: null, error: `Error subiendo imagen: ${error.message}` };
  const { data } = adminClient.storage.from("catalogo").getPublicUrl(fileName);
  return { url: data.publicUrl };
}

async function subirFotos(
  adminClient: ReturnType<typeof createAdminClient>,
  archivos: File[]
): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  for (const archivo of archivos.filter(Boolean)) {
    const { url, error } = await subirImagen(adminClient, archivo, "prod");
    if (error) return { urls: [], error };
    if (url) urls.push(url);
  }
  return { urls };
}

// ============================================================
// Categorías
// ============================================================

export async function crearCategoria(formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const orden = parseInt(formData.get("orden") as string) || 0;
  const imagenArchivo = formData.get("imagen") as File;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > 100) return { error: "El nombre no puede superar 100 caracteres" };

  const { url: imagen, error: uploadError } = await subirImagen(adminClient, imagenArchivo, "cat");
  if (uploadError) return { error: uploadError };

  const { error } = await adminClient
    .from("categories")
    .insert({ nombre, descripcion, orden, imagen });

  if (error) return { error: `Error creando categoría: ${error.message}` };

  return { success: true };
}

export async function editarCategoria(catId: string, formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const orden = parseInt(formData.get("orden") as string) || 0;
  const imagenArchivo = formData.get("imagen") as File;
  const imagenExistente = (formData.get("imagen_existente") as string) || null;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > 100) return { error: "El nombre no puede superar 100 caracteres" };

  let imagen = imagenExistente;
  if (imagenArchivo?.size > 0) {
    const { url, error: uploadError } = await subirImagen(adminClient, imagenArchivo, "cat");
    if (uploadError) return { error: uploadError };
    imagen = url;
  }

  const { error } = await adminClient
    .from("categories")
    .update({ nombre, descripcion, orden, imagen })
    .eq("id", catId);

  if (error) return { error: `Error actualizando categoría: ${error.message}` };

  return { success: true };
}

export async function eliminarCategoria(catId: string) {
  const { adminClient } = await verificarAdmin();

  const { error } = await adminClient.from("categories").delete().eq("id", catId);
  if (error) return { error: error.message };

  return { success: true };
}

// ============================================================
// Productos
// ============================================================

export async function crearProducto(catId: string, formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const archivos = formData.getAll("fotos") as File[];

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > 200) return { error: "El nombre no puede superar 200 caracteres" };

  const { urls: fotos, error: uploadError } = await subirFotos(adminClient, archivos);
  if (uploadError) return { error: uploadError };

  const { error } = await adminClient
    .from("products")
    .insert({ nombre, descripcion, fotos, category_id: catId });

  if (error) return { error: `Error creando producto: ${error.message}` };

  return { success: true };
}

export async function editarProducto(prodId: string, formData: FormData) {
  const { adminClient } = await verificarAdmin();

  const nombre = (formData.get("nombre") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const archivos = formData.getAll("fotos") as File[];
  const fotosExistentesJson = formData.get("fotos_existentes") as string;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > 200) return { error: "El nombre no puede superar 200 caracteres" };

  let fotos: string[] = [];
  try { fotos = JSON.parse(fotosExistentesJson || "[]"); } catch { /* vacío */ }

  const { urls: nuevas, error: uploadError } = await subirFotos(adminClient, archivos);
  if (uploadError) return { error: uploadError };
  fotos = [...fotos, ...nuevas];

  const { error } = await adminClient
    .from("products")
    .update({ nombre, descripcion, fotos })
    .eq("id", prodId);

  if (error) return { error: `Error actualizando producto: ${error.message}` };

  return { success: true };
}

export async function eliminarProducto(prodId: string) {
  const { adminClient } = await verificarAdmin();

  const { error } = await adminClient.from("products").delete().eq("id", prodId);
  if (error) return { error: error.message };

  return { success: true };
}
