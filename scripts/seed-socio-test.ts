import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const email = "socio@tropico.test";
  const password = "socio123";

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: "Socio", apellido: "Test" },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      console.log("El usuario ya existe. Credenciales:");
    } else {
      console.error("Error:", authError.message);
      process.exit(1);
    }
  } else {
    await supabase
      .from("users")
      .update({ nombre: "Socio", apellido: "Test", estado: "Activo", activo: true })
      .eq("id", authUser.user.id);

    console.log("✓ Socio de prueba creado:");
  }

  console.log(`  Email: ${email}`);
  console.log(`  Contraseña: ${password}`);
}

main();
