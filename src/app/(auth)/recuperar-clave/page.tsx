"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RecuperarClavePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/establecer-clave`,
    });

    if (error) {
      setError("Ocurrió un error. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Recuperar Contraseña</h1>

        {sent ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Te enviamos un email a <strong>{email}</strong> con un link para restablecer tu contraseña.
            </p>
            <p className="text-center text-sm text-gray-500">
              Revisá tu bandeja de spam si no lo encontrás.
            </p>
            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Volver al login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-500 text-sm">
              Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar link de recuperación"}
              </button>
            </form>

            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
