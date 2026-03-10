import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/socios"
          className="block rounded-lg border p-6 hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold">Socios</h2>
          <p className="text-sm text-gray-500 mt-1">Gestionar socios del club</p>
        </Link>
        <div className="block rounded-lg border p-6 opacity-50">
          <h2 className="text-lg font-semibold">Contenido</h2>
          <p className="text-sm text-gray-500 mt-1">Próximamente</p>
        </div>
        <div className="block rounded-lg border p-6 opacity-50">
          <h2 className="text-lg font-semibold">Catálogo</h2>
          <p className="text-sm text-gray-500 mt-1">Próximamente</p>
        </div>
      </div>
    </div>
  );
}
