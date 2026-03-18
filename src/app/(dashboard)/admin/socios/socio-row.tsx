"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    const confirmed = confirm(`¿Generar link de reseteo de contraseña para ${socio.email}?`);
    if (!confirmed) return;

    const result = await resetearClave(socio.id);
    if (result?.error) {
      alert(result.error);
    } else if ("resetLink" in result && result.resetLink) {
      setResetLink(result.resetLink);
      setCopied(false);
    }
  }

  async function copiarResetLink() {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
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
      {resetLink && (
        <tr>
          <td colSpan={6} className="px-4 py-3 bg-orange-50 border-t border-orange-100">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-orange-800 font-medium">
                Link de reseteo para {socio.email} — compartilo por WhatsApp o email:
              </p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={resetLink}
                  className="flex-1 rounded border border-orange-200 bg-white px-3 py-1.5 text-xs text-gray-700 font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copiarResetLink}
                  className="shrink-0 rounded bg-orange-500 px-3 py-1.5 text-xs text-white hover:bg-orange-600"
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
                <button
                  onClick={() => setResetLink(null)}
                  className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
