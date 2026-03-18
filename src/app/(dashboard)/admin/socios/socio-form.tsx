"use client";

import { useState, useRef } from "react";
import { ESTADOS_SOCIO } from "@/lib/constants";
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
  action: (formData: FormData) => Promise<{ error: string } | { success: true; inviteLink?: string | null }>;
  defaultValues?: SocioData;
  isEdit?: boolean;
}

export default function SocioForm({ action, defaultValues = {}, isEdit = false }: SocioFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkWarning, setLinkWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "live.com", "otro"];

  const defaultEmail = defaultValues.email ?? "";
  const defaultAtIndex = defaultEmail.indexOf("@");
  const defaultUser = defaultAtIndex !== -1 ? defaultEmail.slice(0, defaultAtIndex) : defaultEmail;
  const defaultDomain = defaultAtIndex !== -1 ? defaultEmail.slice(defaultAtIndex + 1) : EMAIL_DOMAINS[0];
  const isKnownDomain = EMAIL_DOMAINS.includes(defaultDomain);

  const ESTADOS = [...ESTADOS_SOCIO, "Otro"];

  const defaultEstado = defaultValues.estado ?? "En trámite";
  const isKnownEstado = ESTADOS.includes(defaultEstado);
  const [estadoValue, setEstadoValue] = useState(isKnownEstado ? defaultEstado : "Otro");
  const [customEstado, setCustomEstado] = useState(isKnownEstado ? "" : defaultEstado);

  const [emailUser, setEmailUser] = useState(defaultUser);
  const [emailDomain, setEmailDomain] = useState(isKnownDomain ? defaultDomain : "otro");
  const [customDomain, setCustomDomain] = useState(isKnownDomain ? "" : defaultDomain);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fullEmail = emailUser + "@" + (emailDomain === "otro" ? customDomain : emailDomain);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setInviteLink(null);
    setLinkWarning(null);
    setCopied(false);
    setLoading(true);
    try {
      const result = await action(formData);
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
      } else {
        if (isEdit) {
          setSuccess("Socio actualizado correctamente.");
          setTimeout(() => router.push("/admin/socios"), 1500);
        } else {
          setSuccess("Socio creado correctamente.");
          setInviteLink(result.inviteLink ?? null);
          setLinkWarning("linkWarning" in result ? result.linkWarning ?? null : null);
          setLoading(false);
        }
      }
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
      setLoading(false);
    }
  }

  async function copiarLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form action={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Datos principales */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">Datos del socio</legend>

        <div>
          <label className={labelClass}>Email *</label>
          {isEdit ? (
            <>
              <input name="email" type="hidden" value={fullEmail} />
              <input
                type="text"
                disabled
                value={fullEmail}
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar desde acá</p>
            </>
          ) : (
            <>
              <input name="email" type="hidden" value={fullEmail} />
              <div className="mt-1 flex items-center gap-1">
                <input
                  ref={emailRef}
                  type="text"
                  required={!isEdit}
                  autoComplete="off"
                  placeholder="nombre"
                  value={emailUser}
                  onChange={(e) => setEmailUser(e.target.value.replace(/\s/g, ""))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-500 font-medium">@</span>
                <select
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="rounded-md border border-gray-300 px-2 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {EMAIL_DOMAINS.map((d) => (
                    <option key={d} value={d}>{d === "otro" ? "otro..." : d}</option>
                  ))}
                </select>
              </div>
              {emailDomain === "otro" && (
                <input
                  type="text"
                  placeholder="dominio.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className={labelClass}>Nombre *</label>
            <input id="nombre" name="nombre" type="text" required defaultValue={defaultValues.nombre} className={inputClass} />
          </div>
          <div>
            <label htmlFor="apellido" className={labelClass}>Apellido *</label>
            <input id="apellido" name="apellido" type="text" required defaultValue={defaultValues.apellido} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dni" className={labelClass}>DNI *</label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]+"
              title="Solo números"
              defaultValue={defaultValues.dni}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="telefono" className={labelClass}>Teléfono *</label>
            <input
              id="telefono"
              name="telefono"
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]+"
              title="Solo números"
              defaultValue={defaultValues.telefono}
              className={inputClass}
            />
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
            <select
              id="estado"
              name="estado"
              value={estadoValue}
              onChange={(e) => setEstadoValue(e.target.value)}
              className={inputClass}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e === "Otro" ? "Otro..." : e}</option>
              ))}
            </select>
            {estadoValue === "Otro" && (
              <input
                type="text"
                name="estadoCustom"
                placeholder="Describí el estado"
                value={customEstado}
                onChange={(e) => setCustomEstado(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            )}
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
          <textarea id="notas" name="notas" rows={3} maxLength={2000} defaultValue={defaultValues.notas} className={inputClass} />
        </div>

        <div>
          <label htmlFor="observaciones" className={labelClass}>Observaciones</label>
          <textarea id="observaciones" name="observaciones" rows={3} maxLength={2000} defaultValue={defaultValues.observaciones} className={inputClass} />
        </div>
      </fieldset>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal de link de invitación */}
      {inviteLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4 mx-4">
            <h2 className="text-lg font-semibold text-gray-800">Socio creado correctamente</h2>
            <p className="text-sm text-gray-600">
              Compartí este link con el socio para que establezca su contraseña:
            </p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={copiarLink}
                className="shrink-0 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin/socios")}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Volver al listado
              </button>
            </div>
          </div>
        </div>
      )}

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
