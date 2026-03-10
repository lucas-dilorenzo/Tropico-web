import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/inicio";

  const supabase = await createClient();

  // PKCE flow (magic link, email signup)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If it's a recovery or invite, send to set password
      if (type === "recovery" || type === "invite") {
        return NextResponse.redirect(`${origin}/establecer-clave`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Implicit flow (token_hash in URL)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "recovery" | "invite" | "magiclink" | "signup" | "email" });
    if (!error) {
      if (type === "recovery" || type === "invite") {
        return NextResponse.redirect(`${origin}/establecer-clave`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
