import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ESTADOS = [
  "En trámite",
  "Activo",
  "Activo en libro - sin epicrisis",
  "Activo no incluído en libro",
  "Baja por falta de diplomatura",
  "Baja por vinculación con tercero",
  "Baja - otro",
  "No viene más",
  "Anulado",
];

const NOMBRES = ["Lucas", "Martina", "Santiago", "Valentina", "Mateo", "Camila", "Nicolás", "Sofía", "Tomás", "Lucía", "Agustín", "Florencia", "Facundo", "Micaela", "Ignacio", "Julieta", "Ezequiel", "Carolina", "Rodrigo", "Valeria", "Maximiliano", "Natalia", "Sebastián", "Gabriela", "Diego", "Paula", "Leandro", "Romina", "Hernán", "Claudia"];
const APELLIDOS = ["García", "Fernández", "López", "Martínez", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Ortiz", "Gutiérrez", "Chavez", "Ramos", "Medina", "Reyes", "Herrera", "Vargas", "Castro", "Suárez", "Romero", "Álvarez", "Rojas", "Mendoza"];
const DOMINIOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"];
const MEDICOS = ["Dr. Pérez", "Dra. González", "Dr. López", "Dra. Martínez", "Dr. Sánchez"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDni(): string {
  return String(Math.floor(10000000 + Math.random() * 30000000));
}

function randTel(): string {
  return String(Math.floor(1100000000 + Math.random() * 900000000));
}

function randFecha(): string {
  const start = new Date(2018, 0, 1).getTime();
  const end = new Date(2024, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString().split("T")[0];
}

async function main() {
  const TOTAL = 30;
  console.log(`Creando ${TOTAL} socios de prueba...`);

  for (let i = 1; i <= TOTAL; i++) {
    const nombre = rand(NOMBRES);
    const apellido = rand(APELLIDOS);
    const estado = rand(ESTADOS);
    const activo = !estado.toLowerCase().startsWith("baja") && estado !== "Anulado" && estado !== "No viene más";
    const normalizar = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const email = `${normalizar(nombre)}.${normalizar(apellido)}${i}@${rand(DOMINIOS)}`;

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nombre, apellido },
    });

    if (authError) {
      console.error(`  ✗ Error creando ${email}: ${authError.message}`);
      continue;
    }

    const { error: updateError } = await supabase.from("users").update({
      nombre,
      apellido,
      dni: randDni(),
      telefono: randTel(),
      numero_socio: String(1000 + i),
      fecha_ingreso: randFecha(),
      estado,
      activo,
    }).eq("id", authUser.user.id);

    if (updateError) {
      console.error(`  ✗ Error actualizando perfil de ${email}: ${updateError.message}`);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      continue;
    }

    const { error: insertError } = await supabase.from("users_admin_data").insert({
      user_id: authUser.user.id,
      medico: rand(MEDICOS),
      notas: Math.random() > 0.5 ? `Notas de prueba para ${nombre} ${apellido}` : null,
    });

    if (insertError) {
      console.error(`  ✗ Error creando datos admin de ${email}: ${insertError.message}`);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      continue;
    }

    console.log(`  ✓ [${i}/${TOTAL}] ${nombre} ${apellido} — ${estado}`);
  }

  console.log("\n✓ Seed completado.");
}

main();
