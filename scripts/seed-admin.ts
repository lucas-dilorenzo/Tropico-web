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
  const email = "admin@tropico.test";
  const password = "admin123";

  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre_apellido: "Admin Test" },
  });

  if (authError) {
    console.error("Error creando usuario auth:", authError.message);
    process.exit(1);
  }

  console.log("Usuario auth creado:", authUser.user.id);

  // Update role to admin in public.users (trigger already created the row)
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: "admin", nombre_apellido: "Admin Test", activo: true })
    .eq("id", authUser.user.id);

  if (updateError) {
    console.error("Error actualizando rol:", updateError.message);
    process.exit(1);
  }

  console.log("\n✓ Usuario admin creado:");
  console.log(`  Email: ${email}`);
  console.log(`  Contraseña: ${password}`);
  console.log(`  Rol: admin`);
}

main();
