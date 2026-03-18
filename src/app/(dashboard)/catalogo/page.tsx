import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categorias } = await supabase
    .from("categories")
    .select("id, nombre, descripcion, imagen")
    .order("orden", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Catálogo</h1>

      {!categorias?.length ? (
        <p className="text-gray-500 text-sm">No hay categorías disponibles todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categorias.map((cat) => (
            <Link key={cat.id} href={`/catalogo/${cat.id}`} className="group block">
              <div className="bg-white rounded-lg border overflow-hidden group-hover:shadow-md group-hover:border-blue-300 transition-all">
                {cat.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.imagen} alt={cat.nombre} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                    🛒
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-sm">{cat.nombre}</h2>
                  {cat.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.descripcion}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
