"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  // =========================================================
  // SESSION
  // =========================================================

  const [checkingSession, setCheckingSession] = useState(true);

  // =========================================================
  // FORM
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // VÉRIFICATION DE SESSION EXISTANTE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      try {
        const supabase = getSupabaseClient();

        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (sessionError) {
          console.error(
            "Erreur vérification session :",
            sessionError,
          );

          if (mounted) {
            setCheckingSession(false);
          }

          return;
        }

        // -----------------------------------------------------
        // UTILISATEUR DÉJÀ CONNECTÉ
        // -----------------------------------------------------

        if (user) {
          router.replace("/admin");
          return;
        }

        // -----------------------------------------------------
        // AUCUNE SESSION
        // -----------------------------------------------------

        if (mounted) {
          setCheckingSession(false);
        }
      } catch (err) {
        console.error(
          "Erreur inattendue lors de la vérification de session :",
          err,
        );

        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // =========================================================
  // CONNEXION EMAIL / MOT DE PASSE
  // =========================================================

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    if (!password) {
      setError("Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) {
        console.error(
          "Supabase login error:",
          authError,
        );

        setError(
          authError.message ||
            "Adresse email ou mot de passe incorrect.",
        );

        return;
      }

      if (!data.user) {
        setError(
          "La connexion a échoué. Aucun utilisateur n'a été retourné.",
        );

        return;
      }

      // -------------------------------------------------------
      // CONNEXION RÉUSSIE
      // -------------------------------------------------------

      window.location.href = "/admin";
    } catch (err) {
      console.error(
        "Unexpected login error:",
        err,
      );

      setError(
        "Une erreur inattendue est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CONNEXION GOOGLE
  // =========================================================

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const supabase = getSupabaseClient();

      const redirectTo =
        `${window.location.origin}/auth/callback`;

      const { data, error: authError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",

          options: {
            redirectTo,
          },
        });

      if (authError) {
        console.error(
          "Google OAuth error:",
          authError,
        );

        setError(
          authError.message ||
            "Impossible de se connecter avec Google.",
        );

        setGoogleLoading(false);

        return;
      }

      if (!data.url) {
        setError(
          "Google n'a pas fourni d'URL de connexion.",
        );

        setGoogleLoading(false);

        return;
      }

      // -------------------------------------------------------
      // REDIRECTION VERS GOOGLE
      // -------------------------------------------------------

      window.location.href = data.url;
    } catch (err) {
      console.error(
        "Unexpected Google OAuth error:",
        err,
      );

      setError(
        "Une erreur est survenue lors de la connexion avec Google.",
      );

      setGoogleLoading(false);
    }
  };

  // =========================================================
  // VÉRIFICATION DE SESSION EN COURS
  // =========================================================

  if (checkingSession) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border border-black/10 border-t-[#9b7b54]" />

          <span className="text-[8px] uppercase tracking-[0.3em] text-[#777]">
            Vérification de votre session
          </span>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE LOGIN
  // =========================================================

  return (
    <main className="h-screen w-full overflow-hidden bg-white text-[#171717]">
      <div className="grid h-full w-full lg:grid-cols-2">

        {/* =====================================================
            IMAGE
        ===================================================== */}

        <section className="relative hidden h-full overflow-hidden lg:block">

          <motion.div
            initial={{
              scale: 1.08,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src="/images/studio/pr9.jpg"
              alt="Architecture contemporaine"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Overlay */}

          <div className="absolute inset-0 bg-black/[0.08]" />

          {/* =====================================================
              LIGNES ARCHITECTURALES
          ===================================================== */}

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute left-[10%] top-0 h-full w-px bg-white/20" />

            <div className="absolute left-[50%] top-0 h-full w-px bg-white/10" />

            <div className="absolute right-[10%] top-0 h-full w-px bg-white/20" />

            <div className="absolute left-0 top-[20%] h-px w-full bg-white/15" />

            <div className="absolute left-0 top-[80%] h-px w-full bg-white/15" />

          </div>

          {/* =====================================================
              LOGO
          ===================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.6,
            }}
            className="absolute left-8 top-8 z-10"
          >
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-white/70 text-[11px] font-medium text-white">
                A
              </span>

              <div>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-white">
                  Atelier
                </span>

                <span className="mt-1 block text-[7px] uppercase tracking-[0.35em] text-white/65">
                  Architecture
                </span>
              </div>
            </Link>
          </motion.div>

          {/* NUMERO */}

          <div className="absolute right-8 top-8 z-10 text-[8px] uppercase tracking-[0.3em] text-white/70">
            01 — Studio
          </div>

          {/* =====================================================
              TEXTE IMAGE
          ===================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute bottom-9 left-8 right-8 z-10"
          >
            <div className="mb-4 flex items-center gap-3">

              <span className="h-px w-10 bg-white/60" />

              <span className="text-[8px] uppercase tracking-[0.3em] text-white/70">
                Architecture · Design · Matière
              </span>

            </div>

            <h1 className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[0.82] tracking-[-0.06em] text-white">
              L'espace
              <br />

              <span className="text-white/65">
                commence ici.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-[11px] leading-5 text-white/70">
              Concevoir des espaces cohérents, sensibles
              et durables, où chaque ligne participe à
              l'expérience.
            </p>
          </motion.div>

          {/* LABEL VERTICAL */}

          <div className="absolute bottom-9 right-8 z-10 hidden xl:block">
            <span className="block -rotate-90 origin-bottom-right text-[7px] uppercase tracking-[0.35em] text-white/60">
              Contemporary Architecture
            </span>
          </div>

        </section>

        {/* =========================================================
            LOGIN
        ========================================================= */}

        <section className="relative flex h-full flex-col bg-white">

          {/* =====================================================
              TOP BAR
          ===================================================== */}

          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-black/[0.07] px-7 md:px-10">

            <Link
              href="/"
              className="group flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-[#777] transition-colors hover:text-[#171717]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>

              Retour au site
            </Link>

            <span className="text-[8px] uppercase tracking-[0.28em] text-[#aaa]">
              Espace privé
            </span>

          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="flex min-h-0 flex-1 items-center justify-center px-7 py-6 md:px-10">

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-[440px]"
            >

              {/* =================================================
                  INTRO
              ================================================= */}

              <div className="mb-7">

                <div className="mb-4 flex items-center gap-3">

                  <span className="text-[8px] uppercase tracking-[0.3em] text-[#9b7b54]">
                    Connexion
                  </span>

                  <span className="h-px w-8 bg-[#9b7b54]/50" />

                  <span className="text-[8px] tracking-[0.2em] text-[#aaa]">
                    01
                  </span>

                </div>

                <h2 className="font-display text-[clamp(3.5rem,5vw,5rem)] leading-[0.82] tracking-[-0.06em] text-[#171717]">
                  Bienvenue
                  <span className="text-[#9b7b54]">
                    .
                  </span>
                </h2>

                <p className="mt-4 max-w-[360px] text-[12px] leading-5 text-[#777]">
                  Connectez-vous à votre espace de gestion
                  du studio.
                </p>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-[10px] leading-5 text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* =================================================
                  GOOGLE
              ================================================= */}

              <motion.button
                whileHover={{
                  y: -1,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="group flex h-13 w-full items-center justify-center gap-3 border border-black/15 bg-white px-5 text-[#171717] transition-all duration-300 hover:border-[#9b7b54] hover:bg-[#faf9f7] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span className="flex h-7 w-7 items-center justify-center text-[18px] font-semibold">
                  G
                </span>

                <span className="text-[9px] uppercase tracking-[0.22em]">
                  {googleLoading
                    ? "Connexion..."
                    : "Continuer avec Google"}
                </span>

              </motion.button>

              {/* =================================================
                  SEPARATOR
              ================================================= */}

              <div className="my-6 flex items-center gap-4">

                <span className="h-px flex-1 bg-black/[0.08]" />

                <span className="text-[8px] uppercase tracking-[0.25em] text-[#aaa]">
                  ou
                </span>

                <span className="h-px flex-1 bg-black/[0.08]" />

              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div className="group">

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[8px] uppercase tracking-[0.28em] text-[#777]"
                  >
                    Adresse email
                  </label>

                  <div className="relative">

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      disabled={loading || googleLoading}
                      className="h-12 w-full border-b border-black/15 bg-transparent px-0 text-[13px] text-[#171717] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#9b7b54] disabled:opacity-50"
                    />

                    <span className="absolute bottom-0 left-0 h-px w-0 bg-[#9b7b54] transition-all duration-500 group-focus-within:w-full" />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="group">

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-[8px] uppercase tracking-[0.28em] text-[#777]"
                    >
                      Mot de passe
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-[8px] text-[#9b7b54] transition-opacity hover:opacity-60"
                    >
                      Mot de passe oublié ?
                    </Link>

                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled={loading || googleLoading}
                      className="h-12 w-full border-b border-black/15 bg-transparent px-0 pr-16 text-[13px] text-[#171717] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#9b7b54] disabled:opacity-50"
                    />

                    <span className="absolute bottom-0 left-0 h-px w-0 bg-[#9b7b54] transition-all duration-500 group-focus-within:w-full" />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value,
                        )
                      }
                      disabled={loading || googleLoading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.2em] text-[#777] transition-colors hover:text-[#9b7b54] disabled:opacity-50"
                    >
                      {showPassword
                        ? "Masquer"
                        : "Voir"}
                    </button>

                  </div>

                </div>

                {/* REMEMBER */}

                <label className="flex cursor-pointer items-center gap-2.5">

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(
                        event.target.checked,
                      )
                    }
                    disabled={loading || googleLoading}
                    className="h-3.5 w-3.5 cursor-pointer accent-[#9b7b54]"
                  />

                  <span className="text-[11px] text-[#777]">
                    Rester connecté
                  </span>

                </label>

                {/* LOGIN BUTTON */}

                <motion.button
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  type="submit"
                  disabled={loading || googleLoading}
                  className="group relative mt-1 flex h-14 w-full items-center justify-between overflow-hidden bg-[#171717] px-6 text-white disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <span className="absolute inset-0 origin-left scale-x-0 bg-[#9b7b54] transition-transform duration-500 ease-out group-hover:scale-x-100" />

                  <span className="relative z-10 text-[8px] uppercase tracking-[0.3em]">
                    {loading
                      ? "Connexion..."
                      : "Se connecter"}
                  </span>

                  <span className="relative z-10 flex h-7 w-7 items-center justify-center border border-white/25 text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:border-white/60">
                    →
                  </span>

                </motion.button>

              </form>

              {/* =================================================
                  REGISTER
              ================================================= */}

              <div className="mt-6 flex items-center justify-between border-t border-black/[0.08] pt-5">

                <span className="text-[10px] text-[#777]">
                  Pas encore de compte ?
                </span>

                <Link
                  href="/register"
                  className="group flex items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-[#171717]"
                >
                  Créer un compte

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

              </div>

            </motion.div>

          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer className="flex h-[50px] shrink-0 items-center justify-between border-t border-black/[0.06] px-7 md:px-10">

            <span className="text-[7px] uppercase tracking-[0.28em] text-[#aaa]">
              Atelier Architecture
            </span>

            <span className="text-[7px] uppercase tracking-[0.28em] text-[#aaa]">
              Kinshasa · RDC
            </span>

          </footer>

          {/* Fine vertical line */}

          <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-black/[0.04]" />

        </section>

      </div>
    </main>
  );
}

