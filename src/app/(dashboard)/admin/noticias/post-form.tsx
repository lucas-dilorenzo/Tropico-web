"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  titulo: string;
  contenido: string;
  fotos: string[];
  video_url: string | null;
};

type Props = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  post?: Post;
};

export default function PostForm({ action, post }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>(post?.fotos ?? []);
  const [nuevasFotos, setNuevasFotos] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Sincronizar fotos existentes y nuevas
    formData.set("fotos_existentes", JSON.stringify(fotosExistentes));
    formData.delete("fotos");
    for (const file of nuevasFotos) {
      formData.append("fotos", file);
    }

    try {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/admin/noticias");
        router.refresh();
      }
    } catch {
      setError("Error inesperado");
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNuevasFotos((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function quitarNuevaFoto(index: number) {
    setNuevasFotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="titulo"
          type="text"
          defaultValue={post?.titulo}
          required
          maxLength={200}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenido <span className="text-red-500">*</span>
        </label>
        <textarea
          name="contenido"
          defaultValue={post?.contenido}
          required
          rows={10}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video de YouTube (URL)
        </label>
        <input
          name="video_url"
          type="text"
          defaultValue={post?.video_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotos
        </label>

        {/* Fotos existentes */}
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

        {/* Preview de nuevas fotos */}
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
                  onClick={() => quitarNuevaFoto(i)}
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
          onClick={() => router.push("/admin/noticias")}
          className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
