"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleActivoSocio, resetearClave } from "@/lib/actions/socios";

interface Socio {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  numero_socio: string | null;
  telefono: string | null;
  activo: boolean;
  estado: string;
  role: string;
}

export default function SocioRow({ socio }: { socio: Socio }) {
  const router = useRouter();

  async function handleToggleActivo() {
    const confirmed = confirm(
      socio.activo
        ? `¿Dar de baja a ${`${socio.nombre} ${socio.apellido}`.trim() || socio.email}?`
        : `¿Reactivar a ${`${socio.nombre} ${socio.apellido}`.trim() || socio.email}?`
    );
    if (!confirmed) return;

    const result = await toggleActivoSocio(socio.id, !socio.activo);
    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleResetClave() {
    const confirmed = confirm(
      `¿Enviar email de reseteo de contraseña a ${socio.email}?`
    );
    if (!confirmed) return;

    const result = await resetearClave(socio.id);
    if (result?.error) {
      alert(result.error);
    } else {
      alert("Email de reseteo enviado");
    }
  }

  return (
    <tr className={!socio.activo ? "bg-gray-50 opacity-60" : ""}>
      <td className="px-4 py-3 text-sm">
        {`${socio.nombre} ${socio.apellido}`.trim() || <span className="text-gray-400">Sin nombre</span>}
      </td>
      <td className="px-4 py-3 text-sm">{socio.email}</td>
      <td className="px-4 py-3 text-sm">{socio.numero_socio || "-"}</td>
      <td className="px-4 py-3 text-sm">{socio.estado}</td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            socio.activo
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {socio.activo ? "Sí" : "No"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <Link
            href={`/admin/socios/${socio.id}/editar`}
            className="text-blue-600 hover:underline text-xs"
          >
            Editar
          </Link>
          <button
            onClick={handleToggleActivo}
            className={`text-xs hover:underline ${
              socio.activo ? "text-red-600" : "text-green-600"
            }`}
          >
            {socio.activo ? "Dar baja" : "Reactivar"}
          </button>
          <button
            onClick={handleResetClave}
            className="text-xs text-orange-600 hover:underline"
          >
            Reset clave
          </button>
        </div>
      </td>
    </tr>
  );
}
