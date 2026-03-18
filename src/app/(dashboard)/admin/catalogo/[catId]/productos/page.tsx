import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import EliminarProducto from "./eliminar-producto";

export default async function AdminProductosPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  const { data: categoria } = await adminClient
    .from("categories")
    .select("id, nombre")
    .eq("id", catId)
    .single();

  if (!categoria) notFound();

  const { data: productos } = await adminClient
    .from("products")
    .select("id, nombre, descripcion, fotos")
    .eq("category_id", catId)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/catalogo" className="text-sm text-blue-600 hover:text-blue-800">
          ← Catálogo
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6 mt-2">
        <h1 className="text-xl font-semibold">{categoria.nombre} — Productos</h1>
        <Link
          href={`/admin/catalogo/${catId}/productos/nuevo`}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Nuevo producto
        </Link>
      </div>

      {!productos?.length ? (
        <p className="text-gray-500 text-sm">No hay productos en esta categoría.</p>
      ) : (
        <div className="bg-white rounded border divide-y">
          {productos.map((prod) => (
            <div key={prod.id} className="p-4 flex items-center gap-4">
              {prod.fotos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prod.fotos[0]} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{prod.nombre}</p>
                {prod.descripcion && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{prod.descripcion}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/admin/catalogo/${catId}/productos/${prod.id}/editar`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Editar
                </Link>
                <EliminarProducto prodId={prod.id} nombre={prod.nombre} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
