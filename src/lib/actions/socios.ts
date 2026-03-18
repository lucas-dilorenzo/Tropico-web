"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const LIMITS = {
  nombre: 100,
  apellido: 100,
  dni: 20,
  telefono: 20,
  numero_socio: 20,
  estado: 100,
  medico: 100,
  numero_tramite: 50,
  codigo_vinculacion: 50,
  diagnostico: 500,
  notas: 2000,
  observaciones: 2000,
};

function trim(value: string | null): string {
  return (value ?? "").trim();
}

function validarCamposSocio(fields: {
  nombre: string; apellido: string; dni: string; telefono: string; estado: string;
}): string | null {
  if (!fields.nombre) return "El nombre es obligatorio";
  if (!fields.apellido) return "El apellido es obligatorio";
  if (!fields.dni) return "El DNI es obligatorio";
  if (!fields.telefono) return "El teléfono es obligatorio";
  if (!/^\d+$/.test(fields.dni)) return "El DNI debe contener solo números";
  if (!/^\d+$/.test(fields.telefono)) return "El teléfono debe contener solo números";
  if (fields.nombre.length > LIMITS.nombre) return `El nombre no puede superar ${LIMITS.nombre} caracteres`;
  if (fields.apellido.length > LIMITS.apellido) return `El apellido no puede superar ${LIMITS.apellido} caracteres`;
  if (fields.dni.length > LIMITS.dni) return `El DNI no puede superar ${LIMITS.dni} caracteres`;
  if (fields.telefono.length > LIMITS.telefono) return `El teléfono no puede superar ${LIMITS.telefono} caracteres`;
  if (fields.estado.length > LIMITS.estado) return `El estado no puede superar ${LIMITS.estado} caracteres`;
  return null;
}

export async function crearSocio(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/inicio");

  const email = trim(formData.get("email") as string);
  const nombre = trim(formData.get("nombre") as string);
  const apellido = trim(formData.get("apellido") as string);
  const dni = trim(formData.get("dni") as string);
  const numero_socio = trim(formData.get("numero_socio") as string);
  const telefono = trim(formData.get("telefono") as string);
  const fecha_ingreso = trim(formData.get("fecha_ingreso") as string);
  const estadoRaw = trim(formData.get("estado") as string);
  const estadoCustom = trim(formData.get("estadoCustom") as string);
  const estado = estadoRaw === "Otro" ? estadoCustom : estadoRaw;

  // Admin-only fields
  const notas = trim(formData.get("notas") as string);
  const numero_tramite = trim(formData.get("numero_tramite") as string);
  const diagnostico = trim(formData.get("diagnostico") as string);
  const codigo_vinculacion = trim(formData.get("codigo_vinculacion") as string);
  const fecha_vinculacion = trim(formData.get("fecha_vinculacion") as string);
  const medico = trim(formData.get("medico") as string);
  const observaciones = trim(formData.get("observaciones") as string);

  if (!email) return { error: "El email es obligatorio" };
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) return { error: "El formato del email no es válido" };
  if (notas.length > LIMITS.notas) return { error: `Las notas no pueden superar ${LIMITS.notas} caracteres` };
  if (observaciones.length > LIMITS.observaciones) return { error: `Las observaciones no pueden superar ${LIMITS.observaciones} caracteres` };
  if (diagnostico.length > LIMITS.diagnostico) return { error: `El diagnóstico no puede superar ${LIMITS.diagnostico} caracteres` };

  const validationError = validarCamposSocio({ nombre, apellido, dni, telefono, estado });
  if (validationError) return { error: validationError };

  // Verificar DNI único
  if (dni) {
    const { data: existingDni } = await adminClient
      .from("users")
      .select("id")
      .eq("dni", dni)
      .maybeSingle();

    if (existingDni) {
      return { error: `El DNI ${dni} ya está registrado en otro socio` };
    }
  }

  // Create auth user without sending email
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { nombre, apellido },
  });

  if (authError) {
    return { error: `Error creando usuario: ${authError.message || JSON.stringify(authError)}` };
  }

  const authUserId = authUser.user.id;

  // Helper para limpiar el usuario auth si algo falla después de crearlo
  async function rollback() {
    await adminClient.auth.admin.deleteUser(authUserId);
  }

  // Update public.users (trigger already created the row)
  const { error: updateError } = await adminClient
    .from("users")
    .update({
      nombre,
      apellido,
      dni,
      numero_socio: numero_socio || null,
      telefono,
      fecha_ingreso: fecha_ingreso || null,
      estado: estado || "En trámite",
      activo: true,
    })
    .eq("id", authUserId);

  if (updateError) {
    await rollback();
    return { error: `Error actualizando perfil: ${updateError.message}` };
  }

  // Create admin data row
  const { error: adminDataError } = await adminClient
    .from("users_admin_data")
    .insert({
      user_id: authUserId,
      notas: notas || null,
      numero_tramite: numero_tramite || null,
      diagnostico: diagnostico || null,
      codigo_vinculacion: codigo_vinculacion || null,
      fecha_vinculacion: fecha_vinculacion || null,
      medico: medico || null,
      observaciones: observaciones || null,
    });

  if (adminDataError) {
    await rollback();
    return { error: `Error creando datos admin: ${adminDataError.message}` };
  }

  // Generate invite link for admin to share manually
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${siteUrl}/establecer-clave` },
  });

  if (linkError) {
    // Socio fue creado igual, solo falló la generación del link
    return { success: true, inviteLink: null };
  }

  return { success: true, inviteLink: linkData.properties.action_link };
}

export async function editarSocio(userId: string, formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/inicio");

  const nombre = trim(formData.get("nombre") as string);
  const apellido = trim(formData.get("apellido") as string);
  const dni = trim(formData.get("dni") as string);
  const numero_socio = trim(formData.get("numero_socio") as string);
  const telefono = trim(formData.get("telefono") as string);
  const fecha_ingreso = trim(formData.get("fecha_ingreso") as string);
  const estadoRaw = trim(formData.get("estado") as string);
  const estadoCustom = trim(formData.get("estadoCustom") as string);
  const estado = estadoRaw === "Otro" ? estadoCustom : estadoRaw;
  const activo = formData.get("activo") === "true";

  const notas = trim(formData.get("notas") as string);
  const numero_tramite = trim(formData.get("numero_tramite") as string);
  const diagnostico = trim(formData.get("diagnostico") as string);
  const codigo_vinculacion = trim(formData.get("codigo_vinculacion") as string);
  const fecha_vinculacion = trim(formData.get("fecha_vinculacion") as string);
  const medico = trim(formData.get("medico") as string);
  const observaciones = trim(formData.get("observaciones") as string);

  const validationError = validarCamposSocio({ nombre, apellido, dni, telefono, estado });
  if (validationError) return { error: validationError };
  if (notas.length > LIMITS.notas) return { error: `Las notas no pueden superar ${LIMITS.notas} caracteres` };
  if (observaciones.length > LIMITS.observaciones) return { error: `Las observaciones no pueden superar ${LIMITS.observaciones} caracteres` };
  if (diagnostico.length > LIMITS.diagnostico) return { error: `El diagnóstico no puede superar ${LIMITS.diagnostico} caracteres` };

  // Verificar DNI único (excluyendo el socio actual)
  if (dni) {
    const { data: existingDni } = await adminClient
      .from("users")
      .select("id")
      .eq("dni", dni)
      .neq("id", userId)
      .maybeSingle();

    if (existingDni) {
      return { error: `El DNI ${dni} ya está registrado en otro socio` };
    }
  }

  const { error: updateError } = await adminClient
    .from("users")
    .update({
      nombre: nombre || "",
      apellido: apellido || "",
      dni: dni || null,
      numero_socio: numero_socio || null,
      telefono: telefono || null,
      fecha_ingreso: fecha_ingreso || null,
      estado: estado || "pendiente",
      activo,
    })
    .eq("id", userId);

  if (updateError) {
    return { error: `Error actualizando socio: ${updateError.message}` };
  }

  // Sincronizar user_metadata en auth.users
  await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { nombre, apellido },
  });

  // Upsert admin data
  const { error: adminDataError } = await adminClient
    .from("users_admin_data")
    .upsert({
      user_id: userId,
      notas: notas || null,
      numero_tramite: numero_tramite || null,
      diagnostico: diagnostico || null,
      codigo_vinculacion: codigo_vinculacion || null,
      fecha_vinculacion: fecha_vinculacion || null,
      medico: medico || null,
      observaciones: observaciones || null,
    }, { onConflict: "user_id" });

  if (adminDataError) {
    return { error: `Error actualizando datos admin: ${adminDataError.message}` };
  }

  return { success: true };
}

export async function toggleActivoSocio(userId: string, activo: boolean) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/inicio");

  const { error } = await adminClient
    .from("users")
    .update({ activo })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetearClave(userId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/inicio");

  // Obtener email desde auth.users (fuente de verdad)
  const { data: targetAuthUser, error: getUserError } = await adminClient.auth.admin.getUserById(userId);

  if (getUserError || !targetAuthUser.user) {
    return { error: "Usuario no encontrado" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data: linkData, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: targetAuthUser.user.email!,
    options: { redirectTo: `${siteUrl}/establecer-clave` },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, resetLink: linkData.properties.action_link };
}
