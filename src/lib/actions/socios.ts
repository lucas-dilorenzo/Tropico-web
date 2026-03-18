"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

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

  const email = formData.get("email") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const dni = formData.get("dni") as string;
  const numero_socio = formData.get("numero_socio") as string;
  const telefono = formData.get("telefono") as string;
  const fecha_ingreso = formData.get("fecha_ingreso") as string;
  const estadoRaw = formData.get("estado") as string;
  const estadoCustom = formData.get("estadoCustom") as string;
  const estado = estadoRaw === "Otro" ? estadoCustom : estadoRaw;

  // Admin-only fields
  const notas = formData.get("notas") as string;
  const numero_tramite = formData.get("numero_tramite") as string;
  const diagnostico = formData.get("diagnostico") as string;
  const codigo_vinculacion = formData.get("codigo_vinculacion") as string;
  const fecha_vinculacion = formData.get("fecha_vinculacion") as string;
  const medico = formData.get("medico") as string;
  const observaciones = formData.get("observaciones") as string;

  if (!email) {
    return { error: "El email es obligatorio" };
  }

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

  // Update public.users (trigger already created the row)
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
      activo: true,
    })
    .eq("id", authUser.user.id);

  if (updateError) {
    return { error: `Error actualizando perfil: ${updateError.message}` };
  }

  // Create admin data row
  const { error: adminDataError } = await adminClient
    .from("users_admin_data")
    .insert({
      user_id: authUser.user.id,
      notas: notas || null,
      numero_tramite: numero_tramite || null,
      diagnostico: diagnostico || null,
      codigo_vinculacion: codigo_vinculacion || null,
      fecha_vinculacion: fecha_vinculacion || null,
      medico: medico || null,
      observaciones: observaciones || null,
    });

  if (adminDataError) {
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

  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const dni = formData.get("dni") as string;
  const numero_socio = formData.get("numero_socio") as string;
  const telefono = formData.get("telefono") as string;
  const fecha_ingreso = formData.get("fecha_ingreso") as string;
  const estadoRaw = formData.get("estado") as string;
  const estadoCustom = formData.get("estadoCustom") as string;
  const estado = estadoRaw === "Otro" ? estadoCustom : estadoRaw;
  const activo = formData.get("activo") === "true";

  const notas = formData.get("notas") as string;
  const numero_tramite = formData.get("numero_tramite") as string;
  const diagnostico = formData.get("diagnostico") as string;
  const codigo_vinculacion = formData.get("codigo_vinculacion") as string;
  const fecha_vinculacion = formData.get("fecha_vinculacion") as string;
  const medico = formData.get("medico") as string;
  const observaciones = formData.get("observaciones") as string;

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

  // Get the user's email
  const { data: targetUser } = await adminClient
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!targetUser) {
    return { error: "Usuario no encontrado" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data: linkData, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: targetUser.email,
    options: { redirectTo: `${siteUrl}/establecer-clave` },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, resetLink: linkData.properties.action_link };
}
