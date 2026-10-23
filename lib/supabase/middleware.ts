import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest,
) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exécuter le proxy sur les pages
     * de l'application, mais éviter les
     * fichiers statiques.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};