"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fotos: string[];
};

type Props = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  producto?: Producto;
  backUrl: string;
};

export default function ProductoForm({ action, producto, backUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>(producto?.fotos ?? []);
  const [nuevasFotos, setNuevasFotos] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNuevasFotos((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("fotos_existentes", JSON.stringify(fotosExistentes));
    formData.delete("fotos");
    for (const file of nuevasFotos) formData.append("fotos", file);

    try {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(backUrl);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) setError(`Error inesperado: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          name="nombre"
          type="text"
          defaultValue={producto?.nombre}
          required
          maxLength={200}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="descripcion"
          defaultValue={producto?.descripcion ?? ""}
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos</label>

        {fotosExistentes.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {fotosExistentes.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setFotosExistentes((prev) => prev.filter((f) => f !== url))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {nuevasFotos.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {nuevasFotos.map((file, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-24 h-24 object-cover rounded border-2 border-dashed border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setNuevasFotos((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="text-sm text-gray-600"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
