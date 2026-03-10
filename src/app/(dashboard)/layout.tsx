import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("nombre_apellido, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/inicio" className="font-bold text-lg">
            Trópico
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/inicio" className="text-gray-600 hover:text-gray-900">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-gray-600 hover:text-gray-900">
              Catálogo
            </Link>
            <Link href="/perfil" className="text-gray-600 hover:text-gray-900">
              Mi perfil
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {profile?.nombre_apellido || user.email}
          </span>
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
