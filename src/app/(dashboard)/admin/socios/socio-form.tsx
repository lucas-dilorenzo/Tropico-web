"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SocioData {
  email?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  numero_socio?: string;
  telefono?: string;
  fecha_ingreso?: string;
  estado?: string;
  activo?: boolean;
  // Admin data
  notas?: string;
  numero_tramite?: string;
  diagnostico?: string;
  codigo_vinculacion?: string;
  fecha_vinculacion?: string;
  medico?: string;
  observaciones?: string;
}

interface SocioFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  defaultValues?: SocioData;
  isEdit?: boolean;
}

export default function SocioForm({ action, defaultValues = {}, isEdit = false }: SocioFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form action={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Datos principales */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">Datos del socio</legend>

        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isEdit}
            defaultValue={defaultValues.email}
            className={`${inputClass} ${isEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
            placeholder="socio@email.com"
          />
          {isEdit && <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar desde acá</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className={labelClass}>Nombre</label>
            <input id="nombre" name="nombre" type="text" defaultValue={defaultValues.nombre} className={inputClass} />
          </div>
          <div>
            <label htmlFor="apellido" className={labelClass}>Apellido</label>
            <input id="apellido" name="apellido" type="text" defaultValue={defaultValues.apellido} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dni" className={labelClass}>DNI</label>
            <input id="dni" name="dni" type="text" defaultValue={defaultValues.dni} className={inputClass} />
          </div>
          <div>
            <label htmlFor="telefono" className={labelClass}>Teléfono</label>
            <input id="telefono" name="telefono" type="text" defaultValue={defaultValues.telefono} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numero_socio" className={labelClass}>Número de socio</label>
            <input id="numero_socio" name="numero_socio" type="text" defaultValue={defaultValues.numero_socio} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_ingreso" className={labelClass}>Fecha de ingreso</label>
            <input id="fecha_ingreso" name="fecha_ingreso" type="date" defaultValue={defaultValues.fecha_ingreso} className={inputClass} />
          </div>
          <div>
            <label htmlFor="estado" className={labelClass}>Estado</label>
            <input id="estado" name="estado" type="text" defaultValue={defaultValues.estado || "pendiente"} className={inputClass} placeholder="Ej: Activo no incluido en libro" />
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="activo" className={labelClass}>Activo</label>
            <select id="activo" name="activo" defaultValue={defaultValues.activo ? "true" : "false"} className={inputClass}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        )}
      </fieldset>

      {/* Datos admin */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">Datos administrativos (solo admin)</legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numero_tramite" className={labelClass}>Número de trámite</label>
            <input id="numero_tramite" name="numero_tramite" type="text" defaultValue={defaultValues.numero_tramite} className={inputClass} />
          </div>
          <div>
            <label htmlFor="codigo_vinculacion" className={labelClass}>Código de vinculación</label>
            <input id="codigo_vinculacion" name="codigo_vinculacion" type="text" defaultValue={defaultValues.codigo_vinculacion} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_vinculacion" className={labelClass}>Fecha de vinculación</label>
            <input id="fecha_vinculacion" name="fecha_vinculacion" type="date" defaultValue={defaultValues.fecha_vinculacion} className={inputClass} />
          </div>
          <div>
            <label htmlFor="medico" className={labelClass}>Médico</label>
            <input id="medico" name="medico" type="text" defaultValue={defaultValues.medico} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="diagnostico" className={labelClass}>Diagnóstico</label>
          <input id="diagnostico" name="diagnostico" type="text" defaultValue={defaultValues.diagnostico} className={inputClass} />
        </div>

        <div>
          <label htmlFor="notas" className={labelClass}>Notas</label>
          <textarea id="notas" name="notas" rows={3} defaultValue={defaultValues.notas} className={inputClass} />
        </div>

        <div>
          <label htmlFor="observaciones" className={labelClass}>Observaciones</label>
          <textarea id="observaciones" name="observaciones" rows={3} defaultValue={defaultValues.observaciones} className={inputClass} />
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear socio"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/socios")}
          className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
