import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SocioRow from "./socio-row";
import SociosFiltros from "./socios-filtros";
import SociosTh from "./socios-th";

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; pagina?: string; sortBy?: string; sortDir?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/inicio");

  const PAGE_SIZE = 25;
  const pagina = Math.max(1, parseInt(params.pagina ?? "1"));
  const desde = (pagina - 1) * PAGE_SIZE;

  const CAMPOS_VALIDOS = ["nombre", "apellido", "numero_socio", "estado", "activo", "created_at"];
  const sortBy = CAMPOS_VALIDOS.includes(params.sortBy ?? "") ? params.sortBy! : "created_at";
  const ascending = params.sortDir !== "desc";

  let query = adminClient
    .from("users")
    .select("id, email, nombre, apellido, numero_socio, telefono, activo, estado, role", { count: "exact" })
    .order(sortBy, { ascending })
    .range(desde, desde + PAGE_SIZE - 1);

  if (params.q) {
    // Sanitizar input: solo letras, números, espacios, @ y . (evita romper sintaxis PostgREST)
    const sanitized = params.q.replace(/[^a-zA-Z0-9\s@.áéíóúüñÁÉÍÓÚÜÑ]/g, "");
    if (sanitized) {
      const search = `%${sanitized}%`;
      query = query.or(`nombre.ilike.${search},apellido.ilike.${search},email.ilike.${search},numero_socio.ilike.${search}`);
    }
  }

  if (params.estado) {
    query = query.eq("estado", params.estado);
  }

  const { data: socios, error, count } = await query;
  const totalPaginas = Math.ceil((count ?? 0) / PAGE_SIZE);

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
      <SociosFiltros defaultQ={params.q || ""} defaultEstado={params.estado || ""} />

      {error && (
        <p className="text-sm text-red-600">Error cargando socios: {error.message}</p>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SociosTh campo="nombre" label="Nombre" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <SociosTh campo="numero_socio" label="Nro. Socio" />
              <SociosTh campo="estado" label="Estado" />
              <SociosTh campo="activo" label="Activo" />
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>{count} socios encontrados</p>
          <div className="flex gap-1 items-center">
            {(() => {
              const buildHref = (p: number) => {
                const sp = new URLSearchParams();
                if (params.q) sp.set("q", params.q);
                if (params.estado) sp.set("estado", params.estado);
                if (params.sortBy) sp.set("sortBy", params.sortBy);
                if (params.sortDir) sp.set("sortDir", params.sortDir);
                sp.set("pagina", String(p));
                return `/admin/socios?${sp.toString()}`;
              };
              const linkClass = (p: number) => `px-3 py-1 rounded-md border text-sm ${
                p === pagina ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
              }`;
              const pages: (number | "...")[] = [];
              for (let p = 1; p <= totalPaginas; p++) {
                if (p === 1 || p === totalPaginas || (p >= pagina - 2 && p <= pagina + 2)) {
                  pages.push(p);
                } else if (pages[pages.length - 1] !== "...") {
                  pages.push("...");
                }
              }
              return pages.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <Link key={p} href={buildHref(p)} className={linkClass(p)}>{p}</Link>
                )
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
