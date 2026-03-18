"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ESTADOS = [
  "En trámite",
  "Activo",
  "Activo en libro - sin epicrisis",
  "Activo no incluído en libro",
  "Baja por falta de diplomatura",
  "Baja por estar vinculado a gonzalo",
  "Baja - otro",
  "No viene más",
  "Anulado",
];

export default function SociosFiltros({
  defaultQ,
  defaultEstado,
}: {
  defaultQ: string;
  defaultEstado: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(defaultQ);
  const [estado, setEstado] = useState(defaultEstado);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateUrl(newQ: string, newEstado: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newQ) params.set("q", newQ); else params.delete("q");
    if (newEstado) params.set("estado", newEstado); else params.delete("estado");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleQ(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateUrl(value, estado), 350);
  }

  function handleEstado(value: string) {
    setEstado(value);
    updateUrl(q, value);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Buscar por nombre, email o nro. socio..."
        value={q}
        onChange={(e) => handleQ(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm w-72 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <select
        value={estado}
        onChange={(e) => handleEstado(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
    </div>
  );
}
