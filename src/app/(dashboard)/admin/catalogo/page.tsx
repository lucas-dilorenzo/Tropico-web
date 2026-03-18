import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import EliminarCategoria from "./eliminar-categoria";

export default async function AdminCatalogoPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  const { data: categorias } = await adminClient
    .from("categories")
    .select("id, nombre, descripcion, imagen, orden")
    .order("orden", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Catálogo — Categorías</h1>
        <Link
          href="/admin/catalogo/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Nueva categoría
        </Link>
      </div>

      {!categorias?.length ? (
        <p className="text-gray-500 text-sm">No hay categorías creadas todavía.</p>
      ) : (
        <div className="bg-white rounded border divide-y">
          {categorias.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center gap-4">
              {cat.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imagen} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.nombre}</p>
                {cat.descripcion && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{cat.descripcion}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">Orden: {cat.orden}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/admin/catalogo/${cat.id}/productos`}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Productos
                </Link>
                <Link
                  href={`/admin/catalogo/${cat.id}/editar`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Editar
                </Link>
                <EliminarCategoria catId={cat.id} nombre={cat.nombre} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
