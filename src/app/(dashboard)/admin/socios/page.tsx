import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SocioRow from "./socio-row";

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = adminClient
    .from("users")
    .select("id, email, nombre, apellido, numero_socio, telefono, activo, estado, role")
    .order("created_at", { ascending: false });

  if (params.q) {
    const search = `%${params.q}%`;
    query = query.or(`nombre.ilike.${search},apellido.ilike.${search},email.ilike.${search},numero_socio.ilike.${search}`);
  }

  if (params.estado === "activo") {
    query = query.eq("activo", true);
  } else if (params.estado === "inactivo") {
    query = query.eq("activo", false);
  }

  const { data: socios, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Socios</h1>
        <Link
          href="/admin/socios/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700"
        >
          Nuevo socio
        </Link>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          type="text"
          placeholder="Buscar por nombre, email o nro. socio..."
          defaultValue={params.q || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-72 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          name="estado"
          defaultValue={params.estado || ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Filtrar
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600">Error cargando socios: {error.message}</p>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nro. Socio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {socios && socios.length > 0 ? (
              socios.map((socio) => (
                <SocioRow key={socio.id} socio={socio} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No se encontraron socios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
