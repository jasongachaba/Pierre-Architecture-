import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");

  // Aucun code OAuth reçu
  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=missing_code",
        url.origin,
      ),
    );
  }

  const supabase = await getSupabaseServerClient();

  // Échange du code Google contre une session Supabase
  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  // Échec de l'authentification
  if (error) {
    console.error(
      "Erreur échange du code OAuth :",
      error.message,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=oauth_callback_failed",
        url.origin,
      ),
    );
  }

  // Authentification réussie
  return NextResponse.redirect(
    new URL("/admin", url.origin),
  );
}