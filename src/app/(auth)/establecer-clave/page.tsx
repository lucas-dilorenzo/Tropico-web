"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EstablecerClavePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));

        // Detectar error en el hash (ej: link expirado o ya usado)
        const error_code = params.get("error_code");
        if (error_code) {
          const desc = params.get("error_description")?.replace(/\+/g, " ") ?? "El link es inválido o ya fue utilizado.";
          window.history.replaceState(null, "", window.location.pathname);
          if (mounted) setLinkError(desc);
          return;
        }

        // Leer tokens del hash (flujo implícito de invitación)
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          window.history.replaceState(null, "", window.location.pathname);
          if (!mounted) return;
          if (error) {
            setLinkError("No se pudo iniciar la sesión. Solicitá un nuevo link al administrador.");
            return;
          }
          setSessionReady(true);
          return;
        }
      }
      // Sin hash: verificar si ya hay sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) setSessionReady(true);
      else setLinkError("No se encontró una sesión válida. Solicitá un nuevo link al administrador.");
    }

    initSession();
    return () => { mounted = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Ocurrió un error al actualizar la contraseña. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/inicio");
    router.refresh();
  }

  if (linkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow text-center space-y-3">
          <p className="text-red-600 font-medium">Link inválido o expirado</p>
          <p className="text-gray-500 text-sm">{linkError}</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Establecer Contraseña</h1>
        <p className="text-center text-gray-500 text-sm">
          Elegí una contraseña para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
