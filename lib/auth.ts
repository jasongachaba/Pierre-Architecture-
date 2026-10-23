"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export type AuthUser = {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
};

/**
 * ============================================================
 * CLIENT SUPABASE
 * ============================================================
 */

function getClient() {
  return getSupabaseClient();
}

/**
 * ============================================================
 * CONVERSION UTILISATEUR
 * ============================================================
 */

function mapUser(user: any): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? undefined,
    fullName:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      undefined,
    avatarUrl:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      undefined,
  };
}

/**
 * ============================================================
 * INSCRIPTION
 * ============================================================
 */

export async function registerUser(params: {
  fullName: string;
  email: string;
  password: string;
}) {
  const supabase = getClient();

  const fullName = params.fullName.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!fullName) {
    throw new Error("Veuillez saisir votre nom complet.");
  }

  if (!email) {
    throw new Error("Veuillez saisir votre adresse email.");
  }

  if (!password) {
    throw new Error("Veuillez saisir votre mot de passe.");
  }

  if (password.length < 8) {
    throw new Error(
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,

    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Supabase register error:", error);

    throw new Error(
      error.message ||
        "Impossible de créer le compte.",
    );
  }

  return {
    user: mapUser(data.user),
    session: data.session,
    needsEmailConfirmation:
      !!data.user && !data.session,
  };
}

/**
 * ============================================================
 * CONNEXION EMAIL / MOT DE PASSE
 * ============================================================
 */

export async function loginUser(params: {
  email: string;
  password: string;
}) {
  const supabase = getClient();

  const email = params.email.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Veuillez saisir votre adresse email.",
    );
  }

  if (!params.password) {
    throw new Error(
      "Veuillez saisir votre mot de passe.",
    );
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password: params.password,
    });

  if (error) {
    console.error("Supabase login error:", error);

    throw new Error(
      error.message ||
        "Adresse email ou mot de passe incorrect.",
    );
  }

  if (!data.user) {
    throw new Error(
      "La connexion a échoué.",
    );
  }

  return {
    user: mapUser(data.user),
    session: data.session,
  };
}

/**
 * ============================================================
 * CONNEXION GOOGLE
 * ============================================================
 */

export async function loginWithGoogle(
  next = "/admin",
) {
  const supabase = getClient();

  const safeNext =
    next.startsWith("/") ? next : "/admin";

  const redirectTo =
    `${window.location.origin}/auth/callback` +
    `?next=${encodeURIComponent(safeNext)}`;

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",

      options: {
        redirectTo,
      },
    });

  if (error) {
    console.error(
      "Supabase Google OAuth error:",
      error,
    );

    throw new Error(
      error.message ||
        "Impossible de se connecter avec Google.",
    );
  }

  if (!data.url) {
    throw new Error(
      "Google n'a pas fourni d'URL de connexion.",
    );
  }

  window.location.href = data.url;
}

/**
 * ============================================================
 * UTILISATEUR COURANT
 * ============================================================
 */

export async function getCurrentUser() {
  const supabase = getClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Supabase getUser error:",
      error,
    );

    return null;
  }

  return mapUser(user);
}

/**
 * ============================================================
 * SESSION COURANTE
 * ============================================================
 */

export async function getCurrentSession() {
  const supabase = getClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Supabase getSession error:",
      error,
    );

    return null;
  }

  return session;
}

/**
 * ============================================================
 * ÉCOUTE DES CHANGEMENTS D'AUTHENTIFICATION
 * ============================================================
 */

export function onAuthStateChange(
  callback: (
    user: AuthUser | null,
    event: string,
  ) => void,
) {
  const supabase = getClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    async (event : any, session: any) => {
      callback(
        mapUser(session?.user ?? null),
        event,
      );
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * ============================================================
 * DÉCONNEXION
 * ============================================================
 */

export async function logoutUser() {
  const supabase = getClient();

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "Supabase logout error:",
      error,
    );

    throw new Error(
      error.message ||
        "Impossible de se déconnecter.",
    );
  }
}

/**
 * ============================================================
 * MOT DE PASSE OUBLIÉ
 * ============================================================
 */

export async function requestPasswordReset(
  email: string,
) {
  const supabase = getClient();

  const cleanEmail =
    email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error(
      "Veuillez saisir votre adresse email.",
    );
  }

  const redirectTo =
    `${window.location.origin}/reset-password`;

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo,
      },
    );

  if (error) {
    console.error(
      "Supabase password reset error:",
      error,
    );

    throw new Error(
      error.message ||
        "Impossible d'envoyer le lien de récupération.",
    );
  }
}

/**
 * ============================================================
 * CHANGEMENT DE MOT DE PASSE
 * ============================================================
 */

export async function updatePassword(
  password: string,
) {
  const supabase = getClient();

  if (!password || password.length < 8) {
    throw new Error(
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    console.error(
      "Supabase update password error:",
      error,
    );

    throw new Error(
      error.message ||
        "Impossible de modifier le mot de passe.",
    );
  }
}

/**
 * ============================================================
 * RAFRAÎCHISSEMENT DE LA SESSION
 * ============================================================
 */

export async function refreshAuthSession() {
  const supabase = getClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error(
      "Supabase refresh session error:",
      error,
    );

    return null;
  }

  return session;
}