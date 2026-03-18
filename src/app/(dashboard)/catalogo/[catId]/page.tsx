import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: categoria }, { data: productos }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, nombre, descripcion, imagen")
      .eq("id", catId)
      .single(),
    supabase
      .from("products")
      .select("id, nombre, descripcion, fotos")
      .eq("category_id", catId)
      .order("created_at", { ascending: true }),
  ]);

  if (!categoria) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/catalogo" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Catálogo
      </Link>

      {/* Header de categoría */}
      <div className="flex items-center gap-4 mb-8">
        {categoria.imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={categoria.imagen} alt="" className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" />
        )}
        <div>
          <h1 className="text-xl font-semibold">{categoria.nombre}</h1>
          {categoria.descripcion && (
            <p className="text-sm text-gray-500 mt-0.5">{categoria.descripcion}</p>
          )}
        </div>
      </div>

      {/* Grid de productos */}
      {!productos?.length ? (
        <p className="text-gray-500 text-sm">No hay productos en esta categoría todavía.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productos.map((prod) => (
            <div key={prod.id} className="bg-white rounded-lg border overflow-hidden">
              {prod.fotos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prod.fotos[0]}
                  alt={prod.nombre}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-300 text-3xl">
                  📦
                </div>
              )}
              <div className="p-3">
                <p className="font-medium text-sm">{prod.nombre}</p>
                {prod.descripcion && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prod.descripcion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
