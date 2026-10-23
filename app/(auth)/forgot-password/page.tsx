"use client";

import Link from "next/link";
import { motion } from "motion/react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Récupération"
      title="Réinitialiser."
      description="Indiquez votre adresse email. Nous vous enverrons un lien pour créer un nouveau mot de passe."
      footerText="Vous vous souvenez de votre mot de passe ?"
      footerLink="Se connecter"
      footerHref="/login"
    >
      <form className="space-y-8">

        <div>
          <label
            htmlFor="email"
            className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-[#77736c]"
          >
            Adresse email
          </label>

          <input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            className="h-14 w-full border-b border-[#1c1c1a]/20 bg-transparent px-0 text-sm outline-none transition-colors placeholder:text-[#77736c]/50 focus:border-[#9b7b54]"
          />
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="group flex h-14 w-full items-center justify-between bg-[#1c1c1a] px-6 text-white transition-colors hover:bg-[#9b7b54]"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">
            Envoyer le lien
          </span>

          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </motion.button>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-[#1c1c1a]/10" />

          <span className="text-[9px] uppercase tracking-[0.2em] text-[#77736c]">
            ou
          </span>

          <div className="h-px flex-1 bg-[#1c1c1a]/10" />
        </div>

        <Link
          href="/login"
          className="group flex h-14 w-full items-center justify-center border border-[#1c1c1a]/15 text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-[#9b7b54] hover:text-[#9b7b54]"
        >
          Retour à la connexion
        </Link>

      </form>
    </AuthLayout>
  );
}