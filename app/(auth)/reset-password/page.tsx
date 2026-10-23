"use client";

import { useState } from "react";
import { motion } from "motion/react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      eyebrow="Nouveau mot de passe"
      title="Presque terminé."
      description="Choisissez un nouveau mot de passe sécurisé pour retrouver l'accès à votre espace."
      footerText="Vous avez retrouvé votre mot de passe ?"
      footerLink="Se connecter"
      footerHref="/login"
    >
      <form className="space-y-7">

        {/* New password */}
        <div>
          <label
            htmlFor="password"
            className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-[#77736c]"
          >
            Nouveau mot de passe
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              className="h-14 w-full border-b border-[#1c1c1a]/20 bg-transparent px-0 pr-16 text-sm outline-none transition-colors placeholder:text-[#77736c]/50 focus:border-[#9b7b54]"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.2em] text-[#77736c] hover:text-[#9b7b54]"
            >
              {showPassword ? "Masquer" : "Voir"}
            </button>
          </div>
        </div>

        {/* Confirmation */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-[#77736c]"
          >
            Confirmer
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Répétez le mot de passe"
            className="h-14 w-full border-b border-[#1c1c1a]/20 bg-transparent px-0 text-sm outline-none transition-colors placeholder:text-[#77736c]/50 focus:border-[#9b7b54]"
          />
        </div>

        {/* Security indicator */}
        <div className="border-l border-[#9b7b54] pl-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">
            Conseil
          </p>

          <p className="mt-2 text-xs leading-6 text-[#77736c]">
            Utilisez au moins 8 caractères avec un mélange de lettres,
            chiffres et caractères spéciaux.
          </p>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="group flex h-14 w-full items-center justify-between bg-[#1c1c1a] px-6 text-white transition-colors hover:bg-[#9b7b54]"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">
            Modifier le mot de passe
          </span>

          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </motion.button>

      </form>
    </AuthLayout>
  );
}