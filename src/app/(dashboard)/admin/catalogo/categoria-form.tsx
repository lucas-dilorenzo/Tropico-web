"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  imagen: string | null;
};

type Props = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  categoria?: Categoria;
};

export default function CategoriaForm({ action, categoria }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(categoria?.imagen ?? null);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNuevaImagen(file);
    setImagenPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("imagen_existente", categoria?.imagen ?? "");
    formData.delete("imagen");
    if (nuevaImagen) formData.set("imagen", nuevaImagen);

    try {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/catalogo");
        router.refresh();
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
          defaultValue={categoria?.nombre}
          required
          maxLength={100}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="descripcion"
          defaultValue={categoria?.descripcion ?? ""}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
        <input
          name="orden"
          type="number"
          defaultValue={categoria?.orden ?? 0}
          min={0}
          className="w-32 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Menor número aparece primero.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
        {imagenPreview && (
          <div className="relative inline-block mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagenPreview} alt="" className="w-32 h-32 object-cover rounded border" />
            <button
              type="button"
              onClick={() => { setImagenPreview(null); setNuevaImagen(null); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
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
          onClick={() => router.push("/admin/catalogo")}
          className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
