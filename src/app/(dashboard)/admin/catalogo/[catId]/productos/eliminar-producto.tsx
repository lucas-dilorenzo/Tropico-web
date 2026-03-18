"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarProducto } from "@/lib/actions/catalogo";

export default function EliminarProducto({ prodId, nombre }: { prodId: string; nombre: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEliminar() {
    setLoading(true);
    const result = await eliminarProducto(prodId);
    if (result.error) {
      alert(result.error);
      setLoading(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">¿Eliminar &quot;{nombre}&quot;?</span>
        <button onClick={handleEliminar} disabled={loading} className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50">
          {loading ? "..." : "Sí"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-700">No</button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-sm text-red-600 hover:text-red-800">
      Eliminar
    </button>
  );
}
