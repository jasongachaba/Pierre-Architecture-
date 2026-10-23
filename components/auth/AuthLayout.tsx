"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "motion/react";

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerHref: string;
}

export default function AuthLayout({
  children,
  eyebrow,
  title,
  description,
  footerText,
  footerLink,
  footerHref,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#1c1c1a]">
      <div className="grid min-h-screen lg:grid-cols-[42%_58%]">

        {/* =====================================================
            LEFT — BRAND / ARCHITECTURAL VISUAL
        ===================================================== */}
        <section className="relative hidden overflow-hidden border-r border-[#1c1c1a]/10 lg:flex">
          <div className="absolute inset-0">

            {/* Grid architectural */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `
                  linear-gradient(
                    to right,
                    #1c1c1a 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    to bottom,
                    #1c1c1a 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: "80px 80px",
              }}
            />

            {/* Cercle architectural */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9b7b54]/30"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9b7b54]/20"
            />

            {/* Ligne verticale */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="absolute left-1/2 top-[15%] h-[70%] w-px origin-top bg-[#9b7b54]/30"
            />

            {/* Ligne horizontale */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute left-[15%] top-1/2 h-px w-[70%] origin-left bg-[#9b7b54]/30"
            />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <Link href="/" className="group w-fit">
              <div className="text-[11px] font-medium uppercase tracking-[0.35em]">
                Pierre
              </div>

              <div className="mt-1 text-[11px] uppercase tracking-[0.35em] text-[#77736c]">
                Architecture
              </div>

              <div className="mt-4 h-px w-8 bg-[#9b7b54] transition-all duration-500 group-hover:w-16" />
            </Link>

            {/* Centre */}
            <div className="relative">

              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9b7b54]" />

                <span className="text-[9px] uppercase tracking-[0.35em] text-[#77736c]">
                  Studio Architecture
                </span>
              </div>

              <h2 className="max-w-md text-5xl font-light leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Concevoir
                <br />
                <span className="italic text-[#77736c]">
                  l&apos;espace
                </span>
                <br />
                autrement.
              </h2>

              <p className="mt-8 max-w-sm text-sm font-light leading-7 text-[#77736c]">
                Un espace privé pour gérer les projets, les demandes,
                les publications et la vie du studio.
              </p>

              <div className="mt-10 flex items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#9b7b54]">
                  01
                </span>

                <div className="h-px w-16 bg-[#1c1c1a]/15" />

                <span className="text-[9px] uppercase tracking-[0.25em] text-[#77736c]">
                  Espace privé
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#77736c]">
                Kinshasa · RDC
              </p>

              <p className="text-[9px] uppercase tracking-[0.25em] text-[#77736c]">
                © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — AUTH FORM
        ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">

          {/* Mobile logo */}
          <div className="absolute left-6 top-8 sm:left-10 lg:hidden">
            <Link href="/">
              <div className="text-[11px] uppercase tracking-[0.3em]">
                Pierre
              </div>

              <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#77736c]">
                Architecture
              </div>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="w-full max-w-[480px]"
          >

            {/* Header */}
            <div className="mb-12">

              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#9b7b54]" />

                <span className="text-[9px] uppercase tracking-[0.3em] text-[#77736c]">
                  {eyebrow}
                </span>
              </div>

              <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#77736c]">
                {description}
              </p>
            </div>

            {/* Form */}
            <div>
              {children}
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-[#1c1c1a]/10 pt-6">
              <p className="text-center text-xs text-[#77736c]">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="ml-1 text-[#1c1c1a] underline decoration-[#9b7b54]/50 underline-offset-4 transition-colors hover:text-[#9b7b54]"
                >
                  {footerLink}
                </Link>
              </p>
            </div>

          </motion.div>
        </section>
      </div>
    </main>
  );
}