"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    /*
     * =========================================================
     * VALIDATION
     * =========================================================
     */

    if (!cleanName) {
      setError("Veuillez saisir votre nom complet.");
      return;
    }

    if (!cleanEmail) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    if (!password) {
      setError("Veuillez saisir un mot de passe.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    if (!acceptedTerms) {
      setError(
        "Veuillez accepter les conditions d'utilisation et la politique de confidentialité.",
      );
      return;
    }

    /*
     * =========================================================
     * SUPABASE
     * =========================================================
     */

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const {
        data,
        error: authError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      /*
       * =======================================================
       * ERREUR SUPABASE
       * =======================================================
       */

      if (authError) {
        console.error(
          "Supabase registration error:",
          authError,
        );

        setError(
          authError.message ||
            "Impossible de créer votre compte.",
        );

        return;
      }

      /*
       * =======================================================
       * UTILISATEUR CRÉÉ
       * =======================================================
       */

      if (!data.user) {
        setError(
          "Le compte n'a pas pu être créé.",
        );

        return;
      }

      /*
       * =======================================================
       * EMAIL CONFIRMATION
       *
       * Si Supabase exige une confirmation email,
       * data.session sera null.
       * =======================================================
       */

      if (!data.session) {
        setSuccess(
          "Votre compte a été créé. Consultez votre adresse email pour confirmer votre compte.",
        );

        return;
      }

      /*
       * =======================================================
       * SESSION DISPONIBLE
       *
       * Le compte est immédiatement connecté.
       * =======================================================
       */

      setSuccess(
        "Votre compte a été créé avec succès.",
      );

      window.location.href = "/admin";
    } catch (err) {
      console.error(
        "Unexpected registration error:",
        err,
      );

      setError(
        "Une erreur inattendue est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-white text-[#111]">
      <div className="grid h-full min-h-0 lg:grid-cols-2">

        {/* =========================================================
            LEFT — REGISTER
        ========================================================= */}

        <section className="flex h-full min-h-0 flex-col bg-white">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="flex h-14 shrink-0 items-center justify-between px-7 md:px-10">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <span className="flex h-7 w-7 items-center justify-center border border-[#111] text-[9px]">
                A
              </span>

              <span className="text-[8px] uppercase tracking-[0.3em]">
                Atelier
              </span>
            </Link>

            <span className="text-[7px] uppercase tracking-[0.28em] text-black/35">
              02 / 02
            </span>

          </header>

          {/* =====================================================
              MAIN
          ===================================================== */}

          <div className="min-h-0 flex-1 overflow-hidden">

            <div className="flex h-full items-center px-7 md:px-10 lg:px-14">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full max-w-[430px]"
              >

                {/* =================================================
                    INTRO
                ================================================= */}

                <div className="mb-[clamp(14px,2vh,24px)]">

                  <div className="mb-[clamp(8px,1.2vh,14px)] flex items-center gap-3">

                    <span className="text-[7px] uppercase tracking-[0.3em] text-[#9b7b54]">
                      Nouvel accès
                    </span>

                    <span className="h-px w-8 bg-[#9b7b54]/40" />

                  </div>

                  <h1 className="font-display text-[clamp(2.8rem,4.2vw,4.5rem)] leading-[0.8] tracking-[-0.065em]">
                    Créer
                    <br />
                    votre espace
                    <span className="text-[#9b7b54]">
                      .
                    </span>
                  </h1>

                  <p className="mt-[clamp(10px,1.5vh,16px)] max-w-[330px] text-[10px] leading-4 text-black/45">
                    Un espace privé pour échanger avec le
                    studio et suivre vos projets.
                  </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                  onSubmit={handleRegister}
                  className="space-y-[clamp(10px,1.7vh,17px)]"
                >

                  {/* =================================================
                      NAME
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-[7px] uppercase tracking-[0.25em] text-black/45"
                    >
                      Nom complet
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      disabled={loading}
                      className="h-[clamp(34px,4vh,42px)] w-full border-b border-black/15 bg-transparent px-0 text-[12px] outline-none placeholder:text-black/25 focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                    />

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-[7px] uppercase tracking-[0.25em] text-black/45"
                    >
                      Adresse email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      disabled={loading}
                      className="h-[clamp(34px,4vh,42px)] w-full border-b border-black/15 bg-transparent px-0 text-[12px] outline-none placeholder:text-black/25 focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                    />

                  </div>

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-[7px] uppercase tracking-[0.25em] text-black/45"
                    >
                      Mot de passe
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Minimum 8 caractères"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        disabled={loading}
                        className="h-[clamp(34px,4vh,42px)] w-full border-b border-black/15 bg-transparent px-0 pr-14 text-[12px] outline-none placeholder:text-black/25 focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value,
                          )
                        }
                        disabled={loading}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.18em] text-black/40 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showPassword
                          ? "Masquer"
                          : "Voir"}
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-[7px] uppercase tracking-[0.25em] text-black/45"
                    >
                      Confirmation
                    </label>

                    <div className="relative">

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Répétez le mot de passe"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        disabled={loading}
                        className="h-[clamp(34px,4vh,42px)] w-full border-b border-black/15 bg-transparent px-0 pr-14 text-[12px] outline-none placeholder:text-black/25 focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value,
                          )
                        }
                        disabled={loading}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.18em] text-black/40 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showConfirmPassword
                          ? "Masquer"
                          : "Voir"}
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      TERMS
                  ================================================= */}

                  <label className="flex items-start gap-2 pt-0.5">

                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(event) =>
                        setAcceptedTerms(
                          event.target.checked,
                        )
                      }
                      disabled={loading}
                      className="mt-[1px] h-3 w-3 shrink-0 accent-[#111]"
                    />

                    <span className="text-[8px] leading-3.5 text-black/40">
                      J'accepte les conditions
                      d'utilisation et la politique de
                      confidentialité.
                    </span>

                  </label>

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="border border-red-200 bg-red-50 px-3 py-2.5 text-[9px] leading-4 text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* =================================================
                      SUCCESS
                  ================================================= */}

                  {success && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="border border-green-200 bg-green-50 px-3 py-2.5 text-[9px] leading-4 text-green-700"
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* =================================================
                      BUTTON
                  ================================================= */}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={
                      !loading
                        ? { x: 2 }
                        : undefined
                    }
                    whileTap={
                      !loading
                        ? { scale: 0.985 }
                        : undefined
                    }
                    className="group flex h-[clamp(44px,5vh,52px)] w-full items-center justify-between bg-[#111] px-5 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span className="text-[7px] uppercase tracking-[0.3em]">
                      {loading
                        ? "Création..."
                        : "Créer mon compte"}
                    </span>

                    <span className="flex h-6 w-6 items-center justify-center border border-white/25 text-xs transition-transform duration-300 group-hover:translate-x-1">
                      {loading ? "…" : "→"}
                    </span>

                  </motion.button>

                </form>

                {/* =================================================
                    LOGIN
                ================================================= */}

                <div className="mt-[clamp(10px,1.5vh,16px)] flex items-center gap-3">

                  <span className="text-[8px] text-black/40">
                    Déjà membre ?
                  </span>

                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.2em]"
                  >
                    Se connecter

                    <span>→</span>
                  </Link>

                </div>

              </motion.div>

            </div>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer className="flex h-8 shrink-0 items-center justify-between border-t border-black/[0.06] px-7 md:px-10">

            <span className="text-[6px] uppercase tracking-[0.28em] text-black/30">
              Architecture / Design
            </span>

            <span className="text-[6px] uppercase tracking-[0.28em] text-black/30">
              Kinshasa
            </span>

          </footer>

        </section>

        {/* =========================================================
            RIGHT — ARCHITECTURE IMAGE
        ========================================================= */}

        <section className="relative hidden h-full min-h-0 overflow-hidden lg:block">

          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 1.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >

            <Image
              src="/images/projets/pr7.jpg"
              alt="Architecture contemporaine"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />

          </motion.div>

          {/* Léger voile */}

          <div className="absolute inset-0 bg-black/[0.06]" />

          {/* TOP */}

          <div className="absolute left-9 top-8 z-10">

            <span className="text-[8px] uppercase tracking-[0.32em] text-white/80">
              Atelier Architecture
            </span>

          </div>

          {/* BOTTOM */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.7,
            }}
            className="absolute bottom-9 left-9 z-10"
          >

            <span className="mb-3 block text-[7px] uppercase tracking-[0.3em] text-white/55">
              Studio / 02
            </span>

            <h2 className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[0.8] tracking-[-0.06em] text-white">
              Votre projet
              <br />
              <span className="text-white/60">
                commence ici.
              </span>
            </h2>

          </motion.div>

        </section>

      </div>
    </main>
  );
}
